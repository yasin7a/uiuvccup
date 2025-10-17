'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { teamsService, playersService } from '../../lib/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

export default function Auction() {
  const { currentUser, isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidHistory, setBidHistory] = useState([]);
  const [currentBids, setCurrentBids] = useState([]);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState('');
  const [auctionTimer, setAuctionTimer] = useState(30); // 30 seconds per player
  const [isAuctionActive, setIsAuctionActive] = useState(false);
  const [showAssignmentResult, setShowAssignmentResult] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null);

  useEffect(() => {
    loadAuctionData();
  }, []);

  // Timer effect for auction countdown
  useEffect(() => {
    let interval;
    if (isAuctionActive && auctionTimer > 0) {
      interval = setInterval(() => {
        setAuctionTimer(prev => prev - 1);
      }, 1000);
    } else if (auctionTimer === 0 && isAuctionActive) {
      // Time's up - assign player to highest bidder
      assignPlayerToWinner();
    }
    return () => clearInterval(interval);
  }, [isAuctionActive, auctionTimer]);

  // Start auction for current player
  const startAuction = () => {
    if (!currentUser || !isAdmin) {
      alert('Only administrators can start the auction. Please log in as admin.');
      return;
    }
    setIsAuctionActive(true);
    setAuctionTimer(30);
    setCurrentBids([]);
    setHighestBid(0);
    setHighestBidder('');
  };

  // Assign player to highest bidder when timer ends
  const assignPlayerToWinner = async () => {
    if (!currentPlayer || !highestBidder) {
      // No bids, show skipped message and move to next player
      setAssignmentResult({
        player: currentPlayer,
        team: null,
        amount: 0,
        type: 'skipped'
      });
      setShowAssignmentResult(true);
      
      // Hide result after 3 seconds and move to next player
      setTimeout(() => {
        setShowAssignmentResult(false);
        moveToNextPlayer();
      }, 3000);
      return;
    }

    try {
      // Assign player to highest bidding team
      await playersService.assignToTeam(currentPlayer.id, highestBidder);
      
      // Add to bid history
      setBidHistory(prev => [
        { 
          team: highestBidder, 
          amount: highestBid, 
          time: 'Just now',
          player: currentPlayer.name
        },
        ...prev
      ]);
      
      // Show assignment result
      setAssignmentResult({
        player: currentPlayer,
        team: highestBidder,
        amount: highestBid,
        type: 'sold'
      });
      setShowAssignmentResult(true);
      
      // Hide result after 3 seconds and move to next player
      setTimeout(() => {
        setShowAssignmentResult(false);
        moveToNextPlayer();
      }, 3000);
      
    } catch (error) {
      console.error('Error assigning player:', error);
      alert('Failed to assign player. Please try again.');
    }
  };

  // Move to next player and reset auction state
  const moveToNextPlayer = () => {
    // Remove current player from unassigned list
    setUnassignedPlayers(prev => prev.filter((_, index) => index !== currentPlayerIndex));
    
    // Reset auction state for next player
    setIsAuctionActive(false);
    setCurrentBids([]);
    setHighestBid(0);
    setHighestBidder('');
    setBidAmount('');
    setSelectedTeam('');
    setAuctionTimer(30);
    
    // Don't increment currentPlayerIndex since we removed the current player from array
    // The next player will automatically be at the same index
  };

  const loadAuctionData = async () => {
    try {
      setLoading(true);
      
      // Load teams and players in parallel
      const [teamsData, playersData] = await Promise.all([
        teamsService.getAll(),
        playersService.getAll()
      ]);
      
      // Filter unassigned players
      const unassigned = playersData.filter(player => !player.team);
      
      setTeams(teamsData);
      setUnassignedPlayers(unassigned);
    } catch (error) {
      console.error('Error loading auction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPlayer = unassignedPlayers[currentPlayerIndex];

  const handlePlaceBid = () => {
    if (!currentUser || !isAdmin) {
      alert('Only administrators can place bids. Please log in as admin.');
      return;
    }
    if (!bidAmount || !selectedTeam || !currentPlayer || !isAuctionActive) return;
    
    const bidAmountNum = parseInt(bidAmount);
    if (bidAmountNum <= highestBid) {
      alert(`Bid must be higher than current highest bid of ৳${highestBid.toLocaleString()}`);
      return;
    }

    // Add bid to current bids
    const newBid = {
      team: selectedTeam,
      amount: bidAmountNum,
      time: new Date().toLocaleTimeString(),
      player: currentPlayer.name
    };

    setCurrentBids(prev => [newBid, ...prev]);
    
    // Update highest bid
    setHighestBid(bidAmountNum);
    setHighestBidder(selectedTeam);
    
    // Reset form
    setBidAmount('');
    setSelectedTeam('');
    
    // Extend timer by 5 seconds if less than 10 seconds left
    if (auctionTimer < 10) {
      setAuctionTimer(prev => Math.min(prev + 5, 30));
    }
  };

  const skipPlayer = () => {
    // Move to next player without assigning current one
    moveToNextPlayer();
  };


  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0A0D13' }}>
      {/* Header */}
      <section className="pt-32 pb-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Live <span className="text-[#D0620D]">Auction</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Participate in the live player auction. Bid for the best players and build your dream team for the tournament.
            </p>
          </div>
        </div>
      </section>

      {/* Current Auction */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0620D] mx-auto mb-4"></div>
              <p className="text-gray-300">Loading auction data...</p>
            </div>
          ) : showAssignmentResult ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                {assignmentResult.type === 'sold' ? (
                  <div className="bg-green-900 border border-green-600 rounded-2xl p-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-white mb-4">SOLD!</h2>
                    <div className="space-y-3">
                      <p className="text-xl text-white font-semibold">{assignmentResult.player.name}</p>
                      <p className="text-green-300">
                        Assigned to <strong>{assignmentResult.team}</strong>
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        ৳{assignmentResult.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-900 border border-yellow-600 rounded-2xl p-8">
                    <div className="text-6xl mb-4">⏭️</div>
                    <h2 className="text-3xl font-bold text-white mb-4">SKIPPED</h2>
                    <div className="space-y-3">
                      <p className="text-xl text-white font-semibold">{assignmentResult.player.name}</p>
                      <p className="text-yellow-300">No bids received</p>
                      <p className="text-gray-400">Moving to next player...</p>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <div className="text-gray-400 text-sm">Next player in 3 seconds...</div>
                </div>
              </div>
            </div>
          ) : !currentPlayer || unassignedPlayers.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-4xl font-bold text-white mb-4">Auction Complete!</h2>
              <p className="text-gray-300 mb-6">All players have been assigned to teams.</p>
              <Link href="/teams" className="bg-[#D0620D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#B8540B] transition-colors">
                View Teams
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Player Info */}
              <div className="lg:col-span-2">
                <div className="border border-gray-700 rounded-2xl p-8" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center space-x-2 border border-[#D0620D] rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-[#D0620D] rounded-full animate-pulse"></div>
                      <span className="text-[#D0620D] text-sm font-medium uppercase tracking-wider">Live Auction</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${auctionTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-[#D0620D]'}`}>
                        {isAuctionActive ? `${auctionTimer}s` : `${currentPlayerIndex + 1}/${unassignedPlayers.length}`}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {isAuctionActive ? 'Time Left' : 'Player Progress'}
                      </div>
                    </div>
                  </div>

                  {(!currentUser || !isAdmin) && (
                    <div className="mb-6 p-4 border border-yellow-600 bg-yellow-900 rounded-lg text-yellow-200 text-sm">
                      Only administrators can start auctions and place bids. Please log in as admin.
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="w-64 h-64 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700 mx-auto mb-6">
                        <div className="text-6xl">
                          {currentPlayer.position === 'Goalkeeper' ? '🥅' : 
                           currentPlayer.position === 'Defender' ? '🛡️' : 
                           currentPlayer.position === 'Midfielder' ? '⚽' : '🎯'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-4">{currentPlayer.name}</h2>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-2">
                          <span className="bg-[#D0620D] px-3 py-1 rounded-full text-sm text-white">{currentPlayer.position}</span>
                          <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">Age: {currentPlayer.age}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">{currentPlayer.department}</span>
                          <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">{currentPlayer.semester}</span>
                        </div>
                        <div className="bg-gray-800 px-3 py-1 rounded-full text-sm inline-block">ID: {currentPlayer.uniId}</div>
                      </div>

                      {/* Current Bid Status */}
                      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Current Highest Bid:</span>
                          <span className="text-[#D0620D] font-bold text-xl">
                            {highestBid > 0 ? `৳${highestBid.toLocaleString()}` : 'No bids yet'}
                          </span>
                        </div>
                        {highestBidder && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Leading Team:</span>
                            <span className="text-white font-semibold">{highestBidder}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {!isAuctionActive ? (
                          <button 
                            onClick={startAuction}
                            className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
                          >
                            {!currentUser || !isAdmin ? 'Admin access required to start auction' : `Start Auction for ${currentPlayer.name}`}
                          </button>
                        ) : (
                          <>
                            {/* Team Selection */}
                            <div className="space-y-2">
                              <label className="text-gray-300 text-sm font-medium">Select Team</label>
                              <div className="grid grid-cols-2 gap-2">
                                {teams.map((team) => (
                                  <button
                                    key={team.id}
                                    onClick={() => (currentUser && isAdmin) && setSelectedTeam(team.name)}
                                    disabled={!currentUser || !isAdmin}
                                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                                      selectedTeam === team.name && currentUser && isAdmin
                                        ? 'border-[#D0620D] bg-[#D0620D] text-white'
                                        : 'border-gray-600 text-gray-300 ' + (currentUser && isAdmin ? 'hover:border-gray-500' : 'opacity-50 cursor-not-allowed')
                                    }`}
                                  >
                                    {team.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Bid Amount */}
                            <div className="space-y-2">
                              <label className="text-gray-300 text-sm font-medium">Enter Bid Amount</label>
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <input 
                                    type="number" 
                                    placeholder={`Minimum: ৳${(highestBid + 100).toLocaleString()}`}
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    min={highestBid + 100}
                                    disabled={!currentUser || !isAdmin}
                                    className={`w-full px-4 py-3 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:border-[#D0620D] focus:outline-none ${!currentUser || !isAdmin ? 'border-gray-700 opacity-50 cursor-not-allowed' : 'border-gray-600'}`}
                                  />
                                </div>
                                <button 
                                  onClick={handlePlaceBid}
                                  disabled={!currentUser || !isAdmin || !bidAmount || !selectedTeam || parseInt(bidAmount) <= highestBid}
                                  className="bg-[#D0620D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B8540B] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                >
                                  Place Bid
                                </button>
                              </div>
                              <p className="text-gray-400 text-xs">
                                Minimum bid: ৳{(highestBid + 100).toLocaleString()}
                              </p>
                            </div>
                          </>
                        )}
                        
                        <div className="flex gap-3">
                          <button 
                            onClick={skipPlayer}
                            disabled={isAuctionActive}
                            className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Skip Player
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Bid History & Team Status */}
            <div className="space-y-6">
              {/* Current Auction Bids */}
              <div className="border border-gray-700 rounded-xl p-6" style={{ backgroundColor: '#0A0D13' }}>
                <h3 className="text-xl font-bold text-white mb-4">
                  {isAuctionActive ? 'Current Bids' : 'Recent Sales'}
                </h3>
                <div className="space-y-3">
                  {isAuctionActive ? (
                    currentBids.length > 0 ? currentBids.map((bid, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-white font-semibold text-sm">{bid.team}</div>
                          <div className="text-gray-400 text-xs">{bid.time}</div>
                        </div>
                        <div className={`font-bold ${bid.amount === highestBid ? 'text-green-500' : 'text-gray-400'}`}>
                          ৳{bid.amount.toLocaleString()}
                          {bid.amount === highestBid && <span className="ml-2 text-xs">HIGHEST</span>}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400">No bids placed yet</p>
                        <p className="text-gray-500 text-xs mt-1">Start the auction to begin bidding</p>
                      </div>
                    )
                  ) : (
                    bidHistory.length > 0 ? bidHistory.slice(0, 5).map((bid, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-white font-semibold text-sm">{bid.player}</div>
                          <div className="text-gray-400 text-xs">Sold to {bid.team} • {bid.time}</div>
                        </div>
                        <div className="text-[#D0620D] font-bold">৳{bid.amount.toLocaleString()}</div>
                      </div>
                    )) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400">No sales yet</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Team Status */}
              <div className="border border-gray-700 rounded-xl p-6" style={{ backgroundColor: '#0A0D13' }}>
                <h3 className="text-xl font-bold text-white mb-4">Teams</h3>
                <div className="space-y-3">
                  {teams.map((team, index) => (
                    <div key={team.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {team.logo ? (
                          <img 
                            src={team.logo} 
                            alt={`${team.name} logo`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-white font-semibold text-sm">{team.name}</div>
                          <div className="text-gray-400 text-xs">Captain: {team.captain || 'Not assigned'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#D0620D] font-bold text-sm">
                          {bidHistory.filter(bid => bid.team === team.name).length} Players
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* Upcoming Players */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Upcoming Players</h3>
          {unassignedPlayers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {unassignedPlayers.slice(currentPlayerIndex + 1, currentPlayerIndex + 9).map((player, index) => (
                <div key={player.id} className="border border-gray-700 rounded-xl p-6 text-center hover:border-[#D0620D] transition-all duration-300" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">
                      {player.position === 'Goalkeeper' ? '🥅' : 
                       player.position === 'Defender' ? '🛡️' : 
                       player.position === 'Midfielder' ? '⚽' : '🎯'}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{player.name}</h4>
                  <div className="space-y-2 mb-4">
                    <p className="text-[#D0620D] font-semibold">{player.position}</p>
                    <p className="text-gray-300 text-sm">{player.department} • {player.semester}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">University ID</p>
                    <p className="text-white font-bold text-sm">{player.uniId}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">No more players in queue</p>
            </div>
          )}
        </div>
      </section>

      {/* Auction Statistics */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Auction Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">{unassignedPlayers.length + bidHistory.length}</div>
              <div className="text-gray-300">Total Players</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">{bidHistory.length}</div>
              <div className="text-gray-300">Players Assigned</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">
                {bidHistory.length > 0 ? `৳${Math.max(...bidHistory.map(b => b.amount)).toLocaleString()}` : '৳0'}
              </div>
              <div className="text-gray-300">Highest Bid</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">{unassignedPlayers.length}</div>
              <div className="text-gray-300">Remaining</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}