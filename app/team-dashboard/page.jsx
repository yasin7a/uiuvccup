'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { teamsService, playersService } from '../../lib/firebaseService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function TeamOwnerDashboard() {
  const { currentUser, userRole, userTeam, isTeamOwner, loading: authLoading } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!isTeamOwner) {
      router.push('/');
      return;
    }

    loadTeamData();
  }, [currentUser, isTeamOwner, userTeam, authLoading, router]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Load teams and find the user's team
      const [teamsData, playersData] = await Promise.all([
        teamsService.getAll(),
        playersService.getAll()
      ]);
      
      const userTeamData = teamsData.find(t => t.name === userTeam);
      if (userTeamData) {
        setTeam(userTeamData);
        
        // Get players assigned to this team
        const teamPlayers = playersData.filter(player => player.team === userTeam);
        setPlayers(teamPlayers);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0620D] mx-auto mb-4"></div>
          <p className="text-gray-600">{authLoading ? 'Authenticating...' : 'Loading your team dashboard...'}</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to find your team data.</p>
          <Link href="/" className="bg-[#D0620D] text-white px-6 py-3 rounded-lg hover:bg-[#B8540B] transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Calculate position statistics
  const positionStats = {
    Goalkeeper: players.filter(p => p.position === 'Goalkeeper').length,
    Defender: players.filter(p => p.position === 'Defender').length,
    Midfielder: players.filter(p => p.position === 'Midfielder').length,
    Forward: players.filter(p => p.position === 'Forward').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Team Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-6">
            {team.logo ? (
              <img 
                src={team.logo} 
                alt={`${team.name} logo`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: team.color }}
              >
                {team.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-gray-600 mt-1">
                Captain: {team.captain ? (
                  <span className="font-medium text-gray-900">{team.captain}</span>
                ) : (
                  <span className="italic">Not assigned</span>
                )}
              </p>
              <p className="text-gray-600">
                Total Players: <span className="font-medium text-gray-900">{players.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🥅</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Goalkeepers</p>
                <p className="text-2xl font-bold text-gray-900">{positionStats.Goalkeeper}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🛡️</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Defenders</p>
                <p className="text-2xl font-bold text-gray-900">{positionStats.Defender}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⚽</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Midfielders</p>
                <p className="text-2xl font-bold text-gray-900">{positionStats.Midfielder}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎯</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Forwards</p>
                <p className="text-2xl font-bold text-gray-900">{positionStats.Forward}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Team Squad</h2>
          </div>
          
          {players.length > 0 ? (
            <div className="overflow-x-auto">
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
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{player.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {player.position === 'Goalkeeper' ? '🥅' : 
                             player.position === 'Defender' ? '🛡️' : 
                             player.position === 'Midfielder' ? '⚽' : '🎯'}
                          </span>
                          <span className="text-sm text-gray-900">{player.position}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.uniId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {player.name === team.captain ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D0620D] text-white">
                            Captain
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Player</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">⚽</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Players Assigned</h3>
              <p className="text-gray-500">
                Your team doesn't have any players yet. Players will be assigned through the auction process.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link 
            href="/teams" 
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View All Teams
          </Link>
          <Link 
            href="/auction" 
            className="bg-[#D0620D] text-white px-6 py-3 rounded-lg hover:bg-[#B8540B] transition-colors"
          >
            View Auction
          </Link>
        </div>
      </div>
    </div>
  );
}