import Image from 'next/image';
import Link from 'next/link';

export default function Auction() {
  const currentPlayer = {
    name: 'Shakib Al Hasan',
    position: 'Forward',
    age: 22,
    department: 'CSE',
    semester: '8th',
    studentId: 'UIU-2021-001',
    basePrice: 2500,
    currentBid: 4500,
    highestBidder: 'UIU Tigers',
    image: '/assets/player-placeholder.jpg',
    stats: {
      goals: 12,
      assists: 8,
      matches: 15
    }
  };

  const upcomingPlayers = [
    { name: 'Tamim Iqbal', position: 'Midfielder', department: 'EEE', basePrice: 3000, semester: '7th' },
    { name: 'Mushfiqur Rahman', position: 'Defender', department: 'BBA', basePrice: 2800, semester: '6th' },
    { name: 'Liton Das', position: 'Goalkeeper', department: 'CSE', basePrice: 2200, semester: '8th' },
    { name: 'Mahmudullah Riyad', position: 'Forward', department: 'Civil', basePrice: 2400, semester: '5th' }
  ];

  const recentSales = [
    { name: 'Mashrafe Mortaza', team: 'UIU Tigers', price: 5000, position: 'Forward', department: 'CSE' },
    { name: 'Soumya Sarkar', team: 'UIU Eagles', price: 4800, position: 'Midfielder', department: 'EEE' },
    { name: 'Mustafizur Rahman', team: 'UIU Lions', price: 4200, position: 'Defender', department: 'BBA' },
    { name: 'Mehidy Hasan', team: 'UIU Panthers', price: 4500, position: 'Midfielder', department: 'Civil' }
  ];

  const teams = [
    { name: 'UIU Tigers', budget: 25000, spent: 18500, captain: 'Rafiqul Islam' },
    { name: 'UIU Eagles', budget: 25000, spent: 19200, captain: 'Aminul Haque' },
    { name: 'UIU Lions', budget: 25000, spent: 17800, captain: 'Shahidul Rahman' },
    { name: 'UIU Panthers', budget: 25000, spent: 20100, captain: 'Mahbubur Rahman' },
    { name: 'UIU Falcons', budget: 25000, spent: 16900, captain: 'Tanvir Ahmed' },
    { name: 'UIU Wolves', budget: 25000, spent: 18700, captain: 'Nasir Uddin' },
    { name: 'UIU Hawks', budget: 25000, spent: 19500, captain: 'Karim Hassan' },
    { name: 'UIU Phoenix', budget: 25000, spent: 17300, captain: 'Farhan Ali' }
  ];

  const bidHistory = [
    { team: 'UIU Tigers', amount: 4500, time: '2:45' },
    { team: 'UIU Eagles', amount: 4200, time: '2:50' },
    { team: 'UIU Lions', amount: 3800, time: '2:55' },
    { team: 'UIU Panthers', amount: 3500, time: '3:00' },
    { team: 'UIU Tigers', amount: 3200, time: '3:05' }
  ];

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0A0D13' }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg mx-4 lg:mx-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Image
                  src="/assets/uiuvccuplogo.png"
                  alt="UIU VC Cup Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-xl font-bold text-black">
                  UIU VC Cup
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">HOME</Link>
                <Link href="/teams" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">TEAMS</Link>
                <Link href="/auction" className="text-[#D0620D] font-medium">AUCTION</Link>
                <Link href="/about" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">ABOUT</Link>
                <Link href="/blog" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">BLOG</Link>
                <Link 
                  href="/login" 
                  className="bg-[#D0620D] px-6 py-2 rounded-full text-white font-medium hover:bg-[#B8540B] transition-all duration-300"
                >
                  LOGIN
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

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
                    <div className="text-3xl font-bold text-[#D0620D]">2:45</div>
                    <div className="text-gray-300 text-sm">Time Left</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="w-64 h-64 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700 mx-auto mb-6">
                      <div className="text-6xl">⚽</div>
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
                        <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">{currentPlayer.semester} Semester</span>
                      </div>
                      <div className="bg-gray-800 px-3 py-1 rounded-full text-sm inline-block">ID: {currentPlayer.studentId}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#D0620D]">{currentPlayer.stats.goals}</div>
                        <div className="text-gray-300 text-sm">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#D0620D]">{currentPlayer.stats.assists}</div>
                        <div className="text-gray-300 text-sm">Assists</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#D0620D]">{currentPlayer.stats.matches}</div>
                        <div className="text-gray-300 text-sm">Matches</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Base Price:</span>
                        <span className="text-white font-semibold">৳{currentPlayer.basePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Current Bid:</span>
                        <span className="text-[#D0620D] font-bold text-2xl">৳{currentPlayer.currentBid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Highest Bidder:</span>
                        <span className="text-white font-semibold">{currentPlayer.highestBidder}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button className="bg-[#D0620D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B8540B] transition-colors">
                        Place Bid (+৳500)
                      </button>
                      <div className="flex gap-3">
                        <button className="border border-[#D0620D] text-[#D0620D] px-4 py-2 rounded-lg font-semibold hover:bg-[#D0620D] hover:text-white transition-colors flex-1">
                          Auto Bid
                        </button>
                        <button className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex-1">
                          Watch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bid History & Team Status */}
            <div className="space-y-6">
              {/* Bid History */}
              <div className="border border-gray-700 rounded-xl p-6" style={{ backgroundColor: '#0A0D13' }}>
                <h3 className="text-xl font-bold text-white mb-4">Bid History</h3>
                <div className="space-y-3">
                  {bidHistory.map((bid, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <div className="text-white font-semibold text-sm">{bid.team}</div>
                        <div className="text-gray-400 text-xs">{bid.time} ago</div>
                      </div>
                      <div className="text-[#D0620D] font-bold">৳{bid.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Budgets */}
              <div className="border border-gray-700 rounded-xl p-6" style={{ backgroundColor: '#0A0D13' }}>
                <h3 className="text-xl font-bold text-white mb-4">Team Budgets</h3>
                <div className="space-y-3">
                  {teams.slice(0, 4).map((team, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm font-semibold">{team.name}</span>
                        <span className="text-gray-300 text-sm">৳{(team.budget - team.spent).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-[#D0620D]"
                          style={{ width: `${(team.spent / team.budget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Players */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Upcoming Players</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingPlayers.map((player, index) => (
              <div key={index} className="border border-gray-700 rounded-xl p-6 text-center hover:border-[#D0620D] transition-all duration-300" style={{ backgroundColor: '#0A0D13' }}>
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚽</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{player.name}</h4>
                <div className="space-y-2 mb-4">
                  <p className="text-[#D0620D] font-semibold">{player.position}</p>
                  <p className="text-gray-300 text-sm">{player.department} • {player.semester} Semester</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Base Price</p>
                  <p className="text-[#D0620D] font-bold text-lg">৳{player.basePrice.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Sales */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Recent Sales</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {recentSales.map((sale, index) => (
              <div key={index} className="border border-gray-700 rounded-xl p-6 hover:border-[#D0620D] transition-all duration-300" style={{ backgroundColor: '#0A0D13' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚽</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{sale.name}</h4>
                      <p className="text-gray-300">{sale.position}</p>
                      <p className="text-gray-400 text-sm">{sale.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-[#D0620D] text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">
                      SOLD
                    </div>
                    <p className="text-[#D0620D] font-bold text-xl">৳{sale.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">Purchased by:</span>
                  <span className="text-white font-semibold">{sale.team}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auction Statistics */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Auction Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">136</div>
              <div className="text-gray-300">Total Players</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">89</div>
              <div className="text-gray-300">Players Sold</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">৳5,000</div>
              <div className="text-gray-300">Highest Sale</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">47</div>
              <div className="text-gray-300">Remaining</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image
                src="/assets/uiuvccuplogo.png"
                alt="UIU VC Cup Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-lg font-bold text-[#D0620D]">
                UIU VC Cup Football Tournament
              </span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 UIU VC Cup. All rights reserved.</p>
              <p className="text-sm mt-1">Built with Next.js & Firebase</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
