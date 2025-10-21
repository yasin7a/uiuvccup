'use client';
import { useState, useEffect } from 'react';
import { teamsService, playersService, userService } from '../../../lib/firebaseService';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TeamManagement() {
  const { currentUser, isAdmin, userRole, loading: authLoading } = useAuth();
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleViceCaptainChange = async (teamId, viceCaptainName) => {
    try {
      await teamsService.update(teamId, { viceCaptain: viceCaptainName });
      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, viceCaptain: viceCaptainName } : team
      ));

      const team = teams.find(t => t.id === teamId);
      const teamName = team ? team.name : 'Team';
      if (viceCaptainName) {
        showToast(`${viceCaptainName} set as vice captain of ${teamName}!`, 'success');
      } else {
        showToast(`Vice captain removed from ${teamName}!`, 'success');
      }
    } catch (error) {
      console.error('Error updating vice captain:', error);
      showToast('Failed to update vice captain. Please try again.', 'error');
    }
  };

  // Check authentication and load teams
  useEffect(() => {
    console.log('🛡️ TeamManagement: Auth check', {
      authLoading,
      hasUser: !!currentUser,
      userEmail: currentUser?.email,
      userRole,
      isAdmin,
      timestamp: new Date().toISOString()
    });
    
    // Don't redirect while auth is still loading OR if userRole is not set yet
    if (authLoading || (currentUser && userRole === null)) {
      console.log('⏳ TeamManagement: Still loading auth or role, waiting...', {
        authLoading,
        hasUser: !!currentUser,
        userRole
      });
      return;
    }
    
    if (!currentUser) {
      console.log('🚫 TeamManagement: No user, redirecting to login');
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      console.log('🚫 TeamManagement: Not admin, redirecting to team dashboard', {
        userRole,
        isAdmin,
        userEmail: currentUser?.email
      });
      router.push('/team-dashboard'); // Redirect team owners to their dashboard
      return;
    }

    console.log('✅ TeamManagement: Admin access confirmed, loading teams');
    loadTeamsWithPlayerCounts();
  }, [currentUser, isAdmin, authLoading, router, userRole]);

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
    setEditingTeam(team);
  };

  // ===== Teams CSV Upload Helpers =====
  const processTeamsCsvFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(Boolean);
          if (lines.length === 0) return resolve([]);
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

          // Required headers: name. Optional: email, captain, mentor, logo
          const requiredHeaders = ['name'];
          const missing = requiredHeaders.filter(h => !headers.includes(h));
          if (missing.length > 0) {
            reject(new Error(`Missing required columns: ${missing.join(', ')}`));
            return;
          }

          const out = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const values = line.split(',').map(v => v.trim());
            const row = {};
            headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
            if (!row.name) continue;
            out.push({
              name: row.name,
              email: row.email || '',
              captain: row.captain || '',
              mentor: row.mentor || '',
              logo: row.logo || ''
            });
          }
          resolve(out);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleCsvUpload = async (file) => {
    try {
      setCsvUploading(true);
      const teamRows = await processTeamsCsvFile(file);
      if (teamRows.length === 0) {
        showToast('No valid rows found in CSV.', 'error');
        return;
      }
      const created = [];
      for (const row of teamRows) {
        // Upload logo if provided as URL? If it's a URL, we just save it. No file upload in CSV path.
        let ownerId = null;
        let generatedPassword = null;
        if (row.email) {
          try {
            const creds = await userService.createTeamOwner(row.email, row.name);
            ownerId = creds.uid;
            generatedPassword = creds.password;
          } catch (e) {
            console.error('Failed to create owner from CSV row:', row.name, e);
          }
        }
        const teamData = {
          name: row.name,
          captain: row.captain || '',
          mentor: row.mentor || '',
          email: row.email || '',
          ownerId,
          generatedPassword,
          logo: row.logo || null,
          color: '#D0620D'
        };
        const id = await teamsService.create(teamData);
        created.push({ id, ...teamData, players: 0 });
      }
      setTeams([...teams, ...created]);
      setShowCsvModal(false);
      showToast(`Imported ${created.length} team(s) successfully.`, 'success');
    } catch (error) {
      console.error('CSV import failed:', error);
      showToast(`CSV import failed: ${error.message}`, 'error');
    } finally {
      setCsvUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCsvUpload(file);
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
      
      // Find team name for toast message
      const team = teams.find(t => t.id === teamId);
      const teamName = team ? team.name : 'Team';
      
      if (captainName) {
        showToast(`${captainName} successfully set as captain of ${teamName}!`, 'success');
      } else {
        showToast(`Captain removed from ${teamName}!`, 'success');
      }
    } catch (error) {
      console.error('Error updating captain:', error);
      showToast('Failed to update captain. Please try again.', 'error');
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
      
      // Determine email changes and create credentials if needed
      const newEmail = (updatedTeamData.email || '').trim();
      let ownerId = editingTeam.ownerId || null;
      let generatedPassword = editingTeam.generatedPassword || null;
      if (newEmail && newEmail !== (editingTeam.email || '')) {
        try {
          const creds = await userService.createTeamOwner(newEmail, updatedTeamData.name || editingTeam.name);
          ownerId = creds.uid;
          generatedPassword = creds.password;
          showToast(`Owner account created. Email: ${creds.email} Password: ${creds.password}`, 'success');
        } catch (err) {
          console.error('Error creating owner for updated email:', err);
          showToast('Failed to create owner account for the provided email.', 'error');
        }
      }

      // Create updated team data
      const updatedTeam = {
        ...editingTeam,
        name: updatedTeamData.name,
        logo: logoUrl,
        mentor: updatedTeamData.mentor || '',
        email: newEmail || editingTeam.email || '',
        ownerId,
        generatedPassword
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
        
        // Show success message with credentials
        alert(`Team created successfully!\n\nTeam Owner Credentials (for future use):\nEmail: ${ownerCredentials.email}\nPassword: ${ownerCredentials.password}\n\nNote: Team owner can use these credentials to create their account later.`);
        
      } catch (error) {
        console.error('Error creating team owner account:', error);
        alert('Failed to create team owner account. Please check if email is already in use.');
        return;
      }
      
      // Create team data (without players count - will be calculated)
      const teamData = {
        name: newTeamData.name,
        captain: '', // Will be set later when captain is selected
        email: newTeamData.email,
        ownerId: ownerCredentials.uid,
        generatedPassword: ownerCredentials.password,
        logo: logoUrl,
        color: '#D0620D',
        mentor: newTeamData.mentor || ''
      };
      
      // Save to Firebase
      const teamId = await teamsService.create(teamData);
      
      // Add to local state with 0 players initially
      setTeams([...teams, { id: teamId, ...teamData, players: 0 }]);
      setShowAddModal(false);
      
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

  /* Removed legacy CSV helpers and duplicate drag handlers */

  // Show loading screen while auth is being determined or role is being loaded
  if (authLoading || (currentUser && userRole === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0D13' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0620D] mx-auto mb-4"></div>
          <p className="text-white">
            {authLoading ? 'Authenticating...' : 'Loading user role...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Debug info - remove in production */}
      <div className="mb-4 p-3 bg-gray-800 rounded text-xs text-gray-300">
        <strong>Debug:</strong> User: {currentUser?.email || 'None'} | Role: {userRole || 'None'} | Admin: {isAdmin ? 'Yes' : 'No'} | Loading: {authLoading ? 'Yes' : 'No'}
      </div>
      
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
                Captain / Vice Captain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mentor
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
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D0620D] mr-3"></div>
                    <span className="text-gray-500">Loading teams...</span>
                  </div>
                </td>
              </tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No teams found. Add your first team to get started.
                </td>
              </tr>
            ) : (
              teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-start">
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      <div className="mt-1 text-xs text-gray-600 leading-4">
                        <div>
                          Total Spent: <span className="text-gray-900 font-semibold">৳{(() => {
                            const soldSpent = (team.spent ?? (players.filter(p => p.team === team.name).reduce((s, p) => s + (Number(p.soldPrice) || 0), 0)));
                            const raiseSpent = (team.raiseSpent ?? 0);
                            return Number(soldSpent + raiseSpent).toLocaleString();
                          })()}</span>
                        </div>
                        <div>
                          Total Left: <span className="text-[#D0620D] font-semibold">৳{(() => {
                            const total = (team.totalBalance ?? 500000);
                            const soldSpent = (team.spent ?? (players.filter(p => p.team === team.name).reduce((s, p) => s + (Number(p.soldPrice) || 0), 0)));
                            const raiseSpent = (team.raiseSpent ?? 0);
                            return Math.max(total - (soldSpent + raiseSpent), 0).toLocaleString();
                          })()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(() => {
                    const teamPlayers = players.filter(player => player.team === team.name);
                    if (teamPlayers.length === 0) {
                      return <span className="text-gray-400 italic">No players assigned</span>;
                    }
                    return (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Captain</label>
                          <select
                            value={team.captain || ''}
                            onChange={(e) => handleCaptainChange(team.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded focus:ring-[#D0620D] focus:border-[#D0620D] text-sm bg-white w-full"
                          >
                            <option value="">Select Captain</option>
                            {teamPlayers.map(player => (
                              <option key={player.id} value={player.name}>
                                {player.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Vice Captain</label>
                          <select
                            value={team.viceCaptain || ''}
                            onChange={(e) => handleViceCaptainChange(team.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded focus:ring-[#D0620D] focus:border-[#D0620D] text-sm bg-white w-full"
                          >
                            <option value="">Select Vice Captain</option>
                            {teamPlayers.map(player => (
                              <option key={player.id} value={player.name}>
                                {player.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.mentor || <span className="text-gray-400 italic">No mentor</span>}
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
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="text-[#D0620D] hover:text-[#B8540B]"
                      title="Edit Team"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Team"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-9 0h10" />
                      </svg>
                    </button>
                  </div>
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
                mentor: formData.get('mentor'),
                email: formData.get('email')
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
                  <label className="block text-sm font-medium text-gray-700">Mentor Name</label>
                  <input
                    type="text"
                    name="mentor"
                    defaultValue={editingTeam.mentor || ''}
                    placeholder="e.g., Dr. Rahman"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Owner Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingTeam.email || ''}
                    placeholder="e.g., owner@example.com"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  />
                  <p className="mt-1 text-xs text-gray-500">If new email is provided, an owner account will be created and credentials stored.</p>
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
                email: formData.get('email'),
                mentor: formData.get('mentor')
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
                  <label className="block text-sm font-medium text-gray-700">Mentor Name</label>
                  <input
                    type="text"
                    name="mentor"
                    placeholder="e.g., Dr. Rahman"
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
                  <p><strong>Required columns:</strong> name</p>
                  <p><strong>Optional columns:</strong> email, captain, mentor, logo</p>
                  <p><strong>Example:</strong></p>
                  <div className="bg-white border rounded p-2 mt-2 font-mono text-xs">
                    name,email,captain,mentor,logo<br/>
                    UIU Tigers,owner1@example.com,Rafiqul Islam,Dr. Rahman,<br/>
                    UIU Eagles,owner2@example.com,Aminul Haque,,<br/>
                    UIU Lions,,Shahidul Rahman,Prof. Karim,
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
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
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

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}