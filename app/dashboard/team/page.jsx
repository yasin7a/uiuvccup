'use client';
import { useState, useEffect } from 'react';
import { teamsService, playersService, userService } from '../../../lib/firebaseService';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TeamManagement() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [editingTeam, setEditingTeam] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Check authentication and load teams
  useEffect(() => {
    console.log('🛡️ TeamManagement: Auth check', {
      authLoading,
      hasUser: !!currentUser,
      userEmail: currentUser?.email,
      isAdmin,
      timestamp: new Date().toISOString()
    });
    
    // Don't redirect while auth is still loading
    if (authLoading) {
      console.log('⏳ TeamManagement: Still loading auth, waiting...');
      return;
    }
    
    if (!currentUser) {
      console.log('🚫 TeamManagement: No user, redirecting to login');
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      console.log('🚫 TeamManagement: Not admin, redirecting to team dashboard');
      router.push('/team-dashboard'); // Redirect team owners to their dashboard
      return;
    }

    console.log('✅ TeamManagement: Admin access confirmed, loading teams');
    loadTeamsWithPlayerCounts();
  }, [currentUser, isAdmin, authLoading, router]);

  const loadTeamsWithPlayerCounts = async () => {
    try {
      setLoading(true);
      
      // Load teams and players in parallel
      const [teamsData, playersData] = await Promise.all([
        teamsService.getAll(),
        playersService.getAll()
      ]);
      
      // Calculate player count for each team
      const teamsWithPlayerCounts = teamsData.map(team => {
        const playerCount = playersData.filter(player => player.team === team.name).length;
        return {
          ...team,
          players: playerCount
        };
      });
      
      setTeams(teamsWithPlayerCounts);
      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading teams:', error);
      alert('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (team) => {
    setDeleteConfirm(null);
  };

  // Toggle password visibility
  const togglePasswordVisibility = (teamId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  const handleCaptainChange = async (teamId, captainName) => {
    try {
      // Update team captain in Firebase
      await teamsService.update(teamId, { captain: captainName });
      
      // Update local state
      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, captain: captainName } : team
      ));
    } catch (error) {
      console.error('Error updating captain:', error);
      alert('Failed to update captain. Please try again.');
    }
  };

  const handleSaveTeam = async (updatedTeamData, logoFile) => {
    try {
      setUploading(true);
      
      // Upload new logo if provided
      let logoUrl = editingTeam.logo; // Keep existing logo by default
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }
      
      // Create updated team data
      const updatedTeam = {
        ...editingTeam,
        name: updatedTeamData.name,
        captain: updatedTeamData.captain,
        logo: logoUrl
        // Keep existing color unchanged
      };
      
      // Update in Firebase
      await teamsService.update(editingTeam.id, updatedTeam);
      
      // Update local state
      setTeams(teams.map(team => 
        team.id === editingTeam.id ? updatedTeam : team
      ));
      
      setEditingTeam(null);
      alert('Team updated successfully!');
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const uploadLogo = async (file) => {
    if (!file) return null;
    
    try {
      console.log('Starting Cloudinary upload...', file.name);
      
      const result = await uploadToCloudinary(file);
      
      console.log('Cloudinary upload successful:', result);
      return result.url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  const handleAddTeam = async (newTeamData, logoFile) => {
    try {
      setUploading(true);
      
      // Upload logo if provided
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }
      
      // Create team owner account
      let ownerCredentials = null;
      try {
        ownerCredentials = await userService.createTeamOwner(newTeamData.email, newTeamData.name);
      } catch (error) {
        console.error('Error creating team owner account:', error);
        alert('Failed to create team owner account. Please check if email is already in use.');
        return;
      }
      
      // Create team data (without players count - will be calculated)
      const teamData = {
        name: newTeamData.name,
        captain: newTeamData.captain,
        email: newTeamData.email,
        ownerId: ownerCredentials.uid,
        generatedPassword: ownerCredentials.password,
        logo: logoUrl,
        color: '#D0620D'
      };
      
      // Save to Firebase
      const teamId = await teamsService.create(teamData);
      
      // Add to local state with 0 players initially
      setTeams([...teams, { id: teamId, ...teamData, players: 0 }]);
      setShowAddModal(false);
      
      // Show success message with login credentials
      alert(`Team added successfully!\n\nTeam Owner Login Credentials:\nEmail: ${ownerCredentials.email}\nPassword: ${ownerCredentials.password}\n\nPlease share these credentials with the team owner.`);
      
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Failed to add team. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTeam = (teamId) => {
    const teamToDelete = teams.find(team => team.id === teamId);
    if (!teamToDelete) return;

    // Show custom delete confirmation modal
    setDeleteConfirm({
      teamId,
      teamName: teamToDelete.name
    });
  };

  const confirmDeleteTeam = async () => {
    if (!deleteConfirm) return;

    try {
      const { teamId, teamName } = deleteConfirm;
      
      // First, get all players assigned to this team
      const allPlayers = await playersService.getAll();
      const playersInTeam = allPlayers.filter(player => player.team === teamName);
      
      // Unassign all players from this team
      const unassignPromises = playersInTeam.map(player => 
        playersService.assignToTeam(player.id, null)
      );
      
      // Wait for all players to be unassigned
      await Promise.all(unassignPromises);
      
      // Then delete the team
      await teamsService.delete(teamId);
      
      // Update local state
      setTeams(teams.filter(team => team.id !== teamId));
      
      // Close modal (no success message needed)
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
      setDeleteConfirm(null);
    }
  };

  // Function to refresh player counts (can be called when players are assigned/unassigned)
  const refreshPlayerCounts = async () => {
    try {
      const playersData = await playersService.getAll();
      setTeams(prevTeams => 
        prevTeams.map(team => ({
          ...team,
          players: playersData.filter(player => player.team === team.name).length
        }))
      );
    } catch (error) {
      console.error('Error refreshing player counts:', error);
    }
  };

  // CSV file processing function
  const processCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          // Expected headers: name, captain (optional: logo)
          const requiredHeaders = ['name', 'captain'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }
          
          const teams = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const values = line.split(',').map(v => v.trim());
            const teamData = {};
            
            headers.forEach((header, index) => {
              teamData[header] = values[index] || '';
            });
            
            // Validate required fields
            if (!teamData.name || !teamData.captain) {
              continue; // Skip invalid rows
            }
            
            teams.push({
              name: teamData.name,
              captain: teamData.captain,
              color: '#D0620D', // Fixed default color
              logo: teamData.logo || null
            });
          }
          
          resolve(teams);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Handle CSV upload and bulk team creation
  const handleCsvUpload = async (file) => {
    try {
      setCsvUploading(true);
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please upload a CSV file (.csv)');
        return;
      }
      
      // Process CSV file
      const teamsData = await processCsvFile(file);
      
      if (teamsData.length === 0) {
        alert('No valid teams found in the CSV file.');
        return;
      }
      
      // Create teams in Firebase
      const createdTeams = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const teamData of teamsData) {
        try {
          const teamId = await teamsService.create(teamData);
          createdTeams.push({ id: teamId, ...teamData, players: 0 });
          successCount++;
        } catch (error) {
          console.error(`Error creating team ${teamData.name}:`, error);
          errorCount++;
        }
      }
      
      // Update local state
      setTeams(prevTeams => [...prevTeams, ...createdTeams]);
      setShowCsvModal(false);
      
      // Show results
      const message = `CSV Upload Complete!\n\n✅ Successfully created: ${successCount} teams\n${errorCount > 0 ? `❌ Failed to create: ${errorCount} teams` : ''}`;
      alert(message);
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert(`Error processing CSV file: ${error.message}`);
    } finally {
      setCsvUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!csvUploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (csvUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    
    if (csvFile) {
      handleCsvUpload(csvFile);
    } else {
      alert('Please drop a CSV file (.csv)');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
        <p className="text-gray-300">Manage tournament teams and their details</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">All Teams ({teams.length})</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCsvModal(true)}
                disabled={uploading || csvUploading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📄 Upload CSV
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                disabled={uploading || csvUploading}
                className="bg-[#D0620D] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#B8540B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Adding...' : 'Add New Team'}
              </button>
            </div>
          </div>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Captain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D0620D] mr-3"></div>
                    <span className="text-gray-500">Loading teams...</span>
                  </div>
                </td>
              </tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No teams found. Add your first team to get started.
                </td>
              </tr>
            ) : (
              teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {team.logo ? (
                      <img 
                        src={team.logo} 
                        alt={`${team.name} logo`}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full mr-3 flex items-center justify-center"
                        style={{ backgroundColor: team.color }}
                      >
                        <span className="text-white font-bold text-sm">
                          {team.name.substring(4, 6).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="text-sm font-medium text-gray-900">{team.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(() => {
                    const teamPlayers = players.filter(player => player.team === team.name);
                    
                    if (teamPlayers.length === 0) {
                      return <span className="text-gray-400 italic">No players assigned</span>;
                    }
                    
                    return (
                      <select
                        value={team.captain || ''}
                        onChange={(e) => handleCaptainChange(team.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded focus:ring-[#D0620D] focus:border-[#D0620D] text-sm bg-white"
                      >
                        <option value="">Select Captain</option>
                        {teamPlayers.map(player => (
                          <option key={player.id} value={player.name}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.email || <span className="text-gray-400 italic">No email</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">
                      {visiblePasswords[team.id] ? 
                        (team.generatedPassword || 'No password stored') : 
                        '••••••••'
                      }
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(team.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title={visiblePasswords[team.id] ? 'Hide password' : 'Show password'}
                    >
                      {visiblePasswords[team.id] ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.players}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditTeam(team)}
                    className="text-[#D0620D] hover:text-[#B8540B] mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Team</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const logoFile = formData.get('logo');
              
              const teamData = {
                name: formData.get('name'),
                captain: formData.get('captain')
              };
              
              // Pass both team data and logo file
              handleSaveTeam(teamData, logoFile && logoFile.size > 0 ? logoFile : null);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingTeam.name}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Logo</label>
                  <div className="mt-2 mb-3">
                    {editingTeam.logo ? (
                      <img 
                        src={editingTeam.logo} 
                        alt={`${editingTeam.name} logo`}
                        className="w-16 h-16 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center border border-gray-300"
                        style={{ backgroundColor: editingTeam.color }}
                      >
                        <span className="text-white font-bold text-sm">
                          {editingTeam.name.substring(4, 6).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="block text-sm font-medium text-gray-700">Update Logo</label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D0620D] file:text-white hover:file:bg-[#B8540B]"
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional: Upload a new logo to replace the current one</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Captain Name</label>
                  <input
                    type="text"
                    name="captain"
                    defaultValue={editingTeam.captain}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  />
                </div>
                
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div>
                    <strong>Current Players:</strong> {editingTeam.players}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Player count is automatically calculated from assigned players
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#D0620D] rounded-md hover:bg-[#B8540B] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Team</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const logoFile = formData.get('logo');
              
              const teamData = {
                name: formData.get('name'),
                captain: formData.get('captain'),
                email: formData.get('email')
              };
              
              // Pass both team data and logo file
              handleAddTeam(teamData, logoFile && logoFile.size > 0 ? logoFile : null);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., UIU Thunders"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Logo</label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D0620D] file:text-white hover:file:bg-[#B8540B]"
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional: Upload a logo image (JPG, PNG, etc.)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Captain Name</label>
                  <input
                    type="text"
                    name="captain"
                    required
                    placeholder="e.g., Abdullah Rahman"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Owner Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g., owner@example.com"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  />
                  <p className="mt-1 text-xs text-gray-500">A login account will be created for the team owner</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#D0620D] rounded-md hover:bg-[#B8540B] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Adding Team...' : 'Add Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Teams via CSV</h3>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">📋 CSV Format Requirements:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Required columns:</strong> name, captain</p>
                  <p><strong>Optional columns:</strong> logo</p>
                  <p><strong>Example:</strong></p>
                  <div className="bg-white border rounded p-2 mt-2 font-mono text-xs">
                    name,captain,logo<br/>
                    UIU Tigers,Rafiqul Islam,<br/>
                    UIU Eagles,Aminul Haque,<br/>
                    UIU Lions,Shahidul Rahman,
                  </div>
                </div>
              </div>

              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragOver 
                    ? 'border-[#D0620D] bg-orange-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${csvUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleCsvUpload(file);
                    }
                  }}
                  className="hidden"
                  id="csv-upload"
                  disabled={csvUploading}
                />
                <label 
                  htmlFor="csv-upload" 
                  className={`cursor-pointer block ${csvUploading ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="space-y-2">
                    <div className={`text-4xl transition-transform duration-200 ${dragOver ? 'scale-110' : ''}`}>
                      {dragOver ? '📥' : '📄'}
                    </div>
                    <div className="text-lg font-medium text-gray-900">
                      {csvUploading 
                        ? 'Processing CSV...' 
                        : 'Drop CSV file here or click to browse'
                      }
                    </div>
                  </div>
                </label>
              </div>

              {csvUploading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D0620D] mr-2"></div>
                  <span className="text-gray-600">Creating teams in Firebase...</span>
                </div>
              )}
            </div>

            {authLoading && (
              <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0D13' }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0620D] mx-auto mb-4"></div>
                  <p className="text-white">Loading...</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                disabled={csvUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                {csvUploading ? 'Processing...' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Download sample CSV
                  const csvContent = "name,captain,logo\nUIU Tigers,Rafiqul Islam,\nUIU Eagles,Aminul Haque,\nUIU Lions,Shahidul Rahman,";
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'teams_sample.csv';
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                📥 Download Sample
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Team</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to delete <strong>"{deleteConfirm.teamName}"</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This action will also unassign all players from this team.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTeam}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}