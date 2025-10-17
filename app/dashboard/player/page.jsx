'use client';
import { useState, useEffect } from 'react';
import { playersService, teamsService } from '../../../lib/firebaseService';

export default function PlayerManagement() {
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showRandomAssignModal, setShowRandomAssignModal] = useState(false);
  const [selectedCategoryForAssign, setSelectedCategoryForAssign] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Load players and teams from Firebase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playersData, teamsData] = await Promise.all([
        playersService.getAll(),
        teamsService.getAll()
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlayer = async (playerId, teamName) => {
    try {
      await playersService.assignToTeam(playerId, teamName || null);
      setPlayers(players.map(player => 
        player.id === playerId ? { ...player, team: teamName || null } : player
      ));
    } catch (error) {
      console.error('Error assigning player:', error);
      alert('Failed to assign player. Please try again.');
    }
  };

  const handleAddPlayer = async (playerData) => {
    try {
      const playerId = await playersService.create(playerData);
      setPlayers([...players, { id: playerId, ...playerData }]);
      setShowAddModal(false);
      alert('Player added successfully!');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player. Please try again.');
    }
  };

  const handleEditPlayer = async (updatedPlayerData) => {
    try {
      await playersService.update(editingPlayer.id, updatedPlayerData);
      setPlayers(players.map(player => 
        player.id === editingPlayer.id ? { ...editingPlayer, ...updatedPlayerData } : player
      ));
      setEditingPlayer(null);
      alert('Player updated successfully!');
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player. Please try again.');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        await playersService.delete(playerId);
        setPlayers(players.filter(player => player.id !== playerId));
        alert('Player deleted successfully!');
      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Failed to delete player. Please try again.');
      }
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesTeam = selectedTeamFilter === 'all' || 
      (selectedTeamFilter === 'unassigned' && !player.team) ||
      player.team === selectedTeamFilter;
    
    const matchesSearch = player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.uniId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTeam && matchesSearch;
  });

  const getPositionColor = (position) => {
    const colors = {
      'Forward': 'bg-red-100 text-red-800',
      'Midfielder': 'bg-blue-100 text-blue-800',
      'Defender': 'bg-green-100 text-green-800',
      'Goalkeeper': 'bg-yellow-100 text-yellow-800'
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'A': 'bg-purple-100 text-purple-800',
      'B': 'bg-indigo-100 text-indigo-800',
      'C': 'bg-orange-100 text-orange-800',
      'D': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // CSV file processing function for players
  const processCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          // Expected headers: name, uniId, semester, department, age, position, phone, email (optional: team, category)
          const requiredHeaders = ['name', 'uniid', 'semester', 'department', 'age', 'position', 'phone', 'email'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }
          
          const players = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const values = line.split(',').map(v => v.trim());
            const playerData = {};
            
            headers.forEach((header, index) => {
              playerData[header] = values[index] || '';
            });
            
            // Validate required fields
            if (!playerData.name || !playerData.uniid || !playerData.semester || 
                !playerData.department || !playerData.age || !playerData.position || 
                !playerData.phone || !playerData.email) {
              continue; // Skip invalid rows
            }
            
            players.push({
              name: playerData.name,
              uniId: playerData.uniid,
              semester: playerData.semester,
              department: playerData.department,
              age: parseInt(playerData.age),
              position: playerData.position,
              category: playerData.category || '', // Optional category from CSV
              phone: playerData.phone,
              email: playerData.email,
              team: playerData.team || null
            });
          }
          
          resolve(players);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Handle CSV upload and bulk player creation
  const handleCsvUpload = async (file) => {
    try {
      setCsvUploading(true);
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please upload a CSV file (.csv)');
        return;
      }
      
      // Process CSV file
      const playersData = await processCsvFile(file);
      
      if (playersData.length === 0) {
        alert('No valid players found in the CSV file.');
        return;
      }
      
      // Create players in Firebase
      const createdPlayers = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const playerData of playersData) {
        try {
          const playerId = await playersService.create(playerData);
          createdPlayers.push({ id: playerId, ...playerData });
          successCount++;
        } catch (error) {
          console.error(`Error creating player ${playerData.name}:`, error);
          errorCount++;
        }
      }
      
      // Update local state
      setPlayers(prevPlayers => [...prevPlayers, ...createdPlayers]);
      setShowCsvModal(false);
      
      // Show results (no ugly alert, just console log)
      console.log(`CSV Upload Complete! Successfully created: ${successCount} players. Failed: ${errorCount} players.`);
      
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

  // Random assignment function
  const handleRandomAssignment = async () => {
    if (!selectedCategoryForAssign) {
      alert('Please select a category first.');
      return;
    }

    try {
      setAssignmentLoading(true);

      // Get unassigned players from selected category
      const unassignedPlayers = players.filter(player => 
        !player.team && player.category === selectedCategoryForAssign
      );

      if (unassignedPlayers.length === 0) {
        alert(`No unassigned players found in Category ${selectedCategoryForAssign}.`);
        return;
      }

      // Get all available team names
      const teamNames = teams.map(team => team.name);
      
      if (teamNames.length === 0) {
        alert(`No teams available for assignment.`);
        return;
      }

      // Shuffle the unassigned players randomly
      const shuffledPlayers = [...unassignedPlayers].sort(() => Math.random() - 0.5);
      
      // Policy: Maximum 6 players per team from each category
      // Calculate max players we can assign (6 per team × number of teams)
      const maxPlayersToAssign = teamNames.length * 6;
      const playersToAssign = shuffledPlayers.slice(0, maxPlayersToAssign);

      // Assign exactly 6 players per team (policy enforcement)
      const assignments = [];
      for (let i = 0; i < playersToAssign.length; i++) {
        const teamIndex = Math.floor(i / 6); // 6 players per team
        const player = playersToAssign[i];
        const teamName = teamNames[teamIndex];
        
        assignments.push({
          playerId: player.id,
          teamName: teamName,
          playerName: player.name
        });
      }

      // Execute assignments
      let successCount = 0;
      let errorCount = 0;

      for (const assignment of assignments) {
        try {
          await playersService.assignToTeam(assignment.playerId, assignment.teamName);
          successCount++;
        } catch (error) {
          console.error(`Error assigning ${assignment.playerName} to ${assignment.teamName}:`, error);
          errorCount++;
        }
      }

      // Update local state
      setPlayers(prevPlayers => 
        prevPlayers.map(player => {
          const assignment = assignments.find(a => a.playerId === player.id);
          return assignment ? { ...player, team: assignment.teamName } : player;
        })
      );

      // Close modal and show results
      setShowRandomAssignModal(false);
      setSelectedCategoryForAssign('');
      
      const totalUnassigned = unassignedPlayers.length;
      const remainingUnassigned = totalUnassigned - successCount;
      
      alert(`Random assignment completed!\nSuccess: ${successCount} players assigned\nErrors: ${errorCount} players\nRemaining unassigned: ${remainingUnassigned} players\n\nCategory ${selectedCategoryForAssign}: Exactly 6 players assigned per team across ${teamNames.length} teams.\n\nPolicy: Maximum 6 players per team from each category.`);

    } catch (error) {
      console.error('Error during random assignment:', error);
      alert('Failed to complete random assignment. Please try again.');
    } finally {
      setAssignmentLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Player Management</h1>
          <p className="text-gray-300">Manage players and assign them to teams</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowRandomAssignModal(true)}
            disabled={assignmentLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎲 Random Assign
          </button>
          <button 
            onClick={() => setShowCsvModal(true)}
            disabled={csvUploading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📄 Upload CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={csvUploading}
            className="bg-[#D0620D] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#B8540B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add New Player
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Team</label>
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#D0620D] focus:border-[#D0620D]"
            >
              <option value="all">All Players ({players.length})</option>
              <option value="unassigned">Unassigned ({players.filter(p => !p.team).length})</option>
              {teams.map(team => (
                <option key={team.id} value={team.name}>
                  {team.name} ({players.filter(p => p.team === team.name).length})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Players</label>
            <input
              type="text"
              placeholder="Search by name, ID, department, position, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#D0620D] focus:border-[#D0620D]"
            />
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredPlayers.length} of {players.length} players
            </div>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assign Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D0620D] mr-3"></div>
                    <span className="text-gray-500">Loading players...</span>
                  </div>
                </td>
              </tr>
            ) : filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No players found. Add your first player to get started.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{player.name}</div>
                      <div className="text-sm text-gray-500">{player.uniId} • {player.semester} Semester</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(player.category)}`}>
                      Category {player.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{player.department} • Age {player.age}</div>
                      <div className="text-sm text-gray-900">{player.phone}</div>
                      <div className="text-sm text-gray-500">{player.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.team ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {player.team}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={player.team || ''}
                      onChange={(e) => handleAssignPlayer(player.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-[#D0620D] focus:border-[#D0620D] text-sm"
                    >
                      <option value="">Unassigned</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingPlayer(player)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingPlayer(player)}
                        className="text-[#D0620D] hover:text-[#B8540B]"
                        title="Edit Player"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Player"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Player</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const playerData = {
                name: formData.get('name'),
                uniId: formData.get('uniId'),
                semester: formData.get('semester'),
                department: formData.get('department'),
                age: parseInt(formData.get('age')),
                position: formData.get('position'),
                category: formData.get('category'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                team: formData.get('team') || null
              };
              handleAddPlayer(playerData);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">University ID</label>
                  <input type="text" name="uniId" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select name="semester" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]">
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(sem => (
                      <option key={sem} value={`${sem}${sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'}`}>
                        {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select name="department" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]">
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="EEE">Electrical & Electronic Engineering</option>
                    <option value="BBA">Business Administration</option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="English">English</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input type="number" name="age" min="18" max="30" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <select name="position" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]">
                    <option value="">Select Position</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Performance Category</label>
                  <select name="category" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]">
                    <option value="">Select Category</option>
                    <option value="A">Category A</option>
                    <option value="B">Category B</option>
                    <option value="C">Category C</option>
                    <option value="D">Category D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" name="phone" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Assign to Team (Optional)</label>
                  <select name="team" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]">
                    <option value="">Unassigned</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#D0620D] rounded-md hover:bg-[#B8540B]">Add Player</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Player</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const playerData = {
                name: formData.get('name'),
                uniId: formData.get('uniId'),
                semester: formData.get('semester'),
                department: formData.get('department'),
                age: parseInt(formData.get('age')),
                position: formData.get('position'),
                category: formData.get('category'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                team: formData.get('team') || null
              };
              handleEditPlayer(playerData);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={editingPlayer.name}
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">University ID</label>
                  <input 
                    type="text" 
                    name="uniId" 
                    defaultValue={editingPlayer.uniId}
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select 
                    name="semester" 
                    defaultValue={editingPlayer.semester}
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(sem => (
                      <option key={sem} value={`${sem}${sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'}`}>
                        {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select 
                    name="department" 
                    defaultValue={editingPlayer.department}
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="EEE">Electrical & Electronic Engineering</option>
                    <option value="BBA">Business Administration</option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="English">English</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input 
                    type="number" 
                    name="age" 
                    defaultValue={editingPlayer.age}
                    min="18" 
                    max="30" 
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <select 
                    name="position" 
                    defaultValue={editingPlayer.position}
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  >
                    <option value="">Select Position</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Performance Category</label>
                  <select 
                    name="category" 
                    defaultValue={editingPlayer.category || ''}
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  >
                    <option value="">Select Category</option>
                    <option value="A">Category A</option>
                    <option value="B">Category B</option>
                    <option value="C">Category C</option>
                    <option value="D">Category D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    defaultValue={editingPlayer.phone}
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    defaultValue={editingPlayer.email}
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Assign to Team</label>
                  <select 
                    name="team" 
                    defaultValue={editingPlayer.team || ''}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                  >
                    <option value="">Unassigned</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setEditingPlayer(null)} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-[#D0620D] rounded-md hover:bg-[#B8540B]"
                >
                  Update Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Player Modal */}
      {viewingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Player Details</h3>
            <div className="space-y-3">
              <div><strong>Name:</strong> {viewingPlayer.name}</div>
              <div><strong>University ID:</strong> {viewingPlayer.uniId}</div>
              <div><strong>Semester:</strong> {viewingPlayer.semester}</div>
              <div><strong>Department:</strong> {viewingPlayer.department}</div>
              <div><strong>Age:</strong> {viewingPlayer.age}</div>
              <div><strong>Position:</strong> {viewingPlayer.position}</div>
              <div><strong>Performance Category:</strong> {viewingPlayer.category || 'Not assigned'}</div>
              <div><strong>Phone:</strong> {viewingPlayer.phone}</div>
              <div><strong>Email:</strong> {viewingPlayer.email}</div>
              <div><strong>Current Team:</strong> {viewingPlayer.team || 'Unassigned'}</div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingPlayer(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Players via CSV</h3>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">📋 CSV Format Requirements:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Required columns:</strong> name, uniId, semester, department, age, position, phone, email</p>
                  <p><strong>Optional columns:</strong> team</p>
                  <p><strong>Example:</strong></p>
                  <div className="bg-white border rounded p-2 mt-2 font-mono text-xs">
                    name,uniId,semester,department,age,position,phone,email,team<br/>
                    John Doe,UIU-2021-001,5th,CSE,22,Forward,01712345678,john@example.com,UIU Tigers<br/>
                    Jane Smith,UIU-2021-002,6th,EEE,23,Midfielder,01798765432,jane@example.com,<br/>
                    Mike Johnson,UIU-2021-003,7th,BBA,24,Defender,01687654321,mike@example.com,UIU Eagles
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
                        : dragOver 
                          ? 'Drop CSV file here' 
                          : 'Click to upload or drag & drop CSV file'
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      {csvUploading 
                        ? 'Please wait while we create your players' 
                        : dragOver 
                          ? 'Release to upload the file'
                          : 'Select a CSV file with player data or drag it here'
                      }
                    </div>
                  </div>
                </label>
              </div>

              {csvUploading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D0620D] mr-2"></div>
                  <span className="text-gray-600">Creating players in Firebase...</span>
                </div>
              )}
            </div>

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
                  const csvContent = "name,uniId,semester,department,age,position,category,phone,email,team\nJohn Doe,UIU-2021-001,5th,CSE,22,Forward,A,01712345678,john@example.com,UIU Tigers\nJane Smith,UIU-2021-002,6th,EEE,23,Midfielder,B,01798765432,jane@example.com,\nMike Johnson,UIU-2021-003,7th,BBA,24,Defender,C,01687654321,mike@example.com,UIU Eagles";
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'players_sample.csv';
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

      {/* Random Assignment Modal */}
      {showRandomAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Random Player Assignment</h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                This will randomly assign <strong>maximum 6 players per team</strong> from the selected category across all available teams.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Policy:</strong> Each team gets exactly 6 players from each category. If more players are available, they remain unassigned for future use.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Warning:</strong> This action cannot be undone. Players will be distributed evenly across available teams.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Category to Assign
                </label>
                <select
                  value={selectedCategoryForAssign}
                  onChange={(e) => setSelectedCategoryForAssign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#D0620D] focus:border-[#D0620D]"
                >
                  <option value="">Choose a category...</option>
                  <option value="A">Category A</option>
                  <option value="B">Category B</option>
                  <option value="C">Category C</option>
                  <option value="D">Category D</option>
                </select>
              </div>

              {selectedCategoryForAssign && (
                <div className="mt-3 text-sm text-gray-600">
                  {(() => {
                    const unassignedCount = players.filter(p => !p.team && p.category === selectedCategoryForAssign).length;
                    const maxAssignable = teams.length * 6;
                    const willAssign = Math.min(unassignedCount, maxAssignable);
                    const willRemain = unassignedCount - willAssign;
                    
                    return (
                      <>
                        <p>
                          <strong>Unassigned players in Category {selectedCategoryForAssign}:</strong> {unassignedCount}
                        </p>
                        <p>
                          <strong>Available teams:</strong> {teams.length}
                        </p>
                        <p>
                          <strong>Will assign:</strong> {willAssign} players (6 per team)
                        </p>
                        {willRemain > 0 && (
                          <p className="text-orange-600">
                            <strong>Will remain unassigned:</strong> {willRemain} players
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowRandomAssignModal(false);
                  setSelectedCategoryForAssign('');
                }}
                disabled={assignmentLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRandomAssignment}
                disabled={assignmentLoading || !selectedCategoryForAssign}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignmentLoading ? 'Assigning...' : '🎲 Start Random Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
