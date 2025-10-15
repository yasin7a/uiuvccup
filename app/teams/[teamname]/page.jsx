import Image from 'next/image';
import Link from 'next/link';

export default function TeamDetail({ params }) {
  // This would normally come from a database or API
  const teamData = {
    'uiu-tigers': {
      name: 'UIU Tigers',
      color: '#D0620D',
      captain: 'Rafiqul Islam',
      coach: 'Abdur Rahman',
      wins: 5,
      losses: 2,
      goalsFor: 18,
      goalsAgainst: 8,
      budget: 25000,
      spent: 23000,
      players: [
        { name: 'Rafiqul Islam', position: 'Forward', price: 2500, goals: 8, assists: 3 },
        { name: 'Shakib Ahmed', position: 'Midfielder', price: 2000, goals: 3, assists: 7 },
        { name: 'Mahmud Hassan', position: 'Defender', price: 1800, goals: 1, assists: 2 },
        { name: 'Kamal Uddin', position: 'Goalkeeper', price: 2200, goals: 0, assists: 0 },
        { name: 'Rashed Khan', position: 'Forward', price: 2300, goals: 6, assists: 2 },
        { name: 'Sajib Rahman', position: 'Midfielder', price: 1900, goals: 2, assists: 5 },
        { name: 'Tariq Hasan', position: 'Defender', price: 1600, goals: 0, assists: 1 },
        { name: 'Jahangir Alam', position: 'Defender', price: 1700, goals: 1, assists: 0 }
      ]
    },
    'uiu-eagles': {
      name: 'UIU Eagles',
      color: '#3B82F6',
      captain: 'Aminul Haque',
      coach: 'Shahidul Islam',
      wins: 4,
      losses: 3,
      goalsFor: 15,
      goalsAgainst: 12,
      budget: 25000,
      spent: 24500,
      players: [
        { name: 'Aminul Haque', position: 'Midfielder', price: 2800, goals: 5, assists: 8 },
        { name: 'Sumon Ali', position: 'Forward', price: 2600, goals: 7, assists: 2 },
        { name: 'Polash Rahman', position: 'Defender', price: 2000, goals: 0, assists: 3 },
        { name: 'Maruf Khan', position: 'Goalkeeper', price: 2400, goals: 0, assists: 0 }
      ]
    },
    'uiu-lions': {
      name: 'UIU Lions',
      color: '#10B981',
      captain: 'Shahidul Rahman',
      coach: 'Nasir Ahmed',
      wins: 6,
      losses: 1,
      goalsFor: 20,
      goalsAgainst: 6,
      budget: 25000,
      spent: 24200,
      players: [
        { name: 'Shahidul Rahman', position: 'Forward', price: 2700, goals: 9, assists: 4 },
        { name: 'Habib Ullah', position: 'Midfielder', price: 2400, goals: 4, assists: 6 },
        { name: 'Ripon Mia', position: 'Defender', price: 1900, goals: 1, assists: 2 },
        { name: 'Rubel Hossain', position: 'Goalkeeper', price: 2300, goals: 0, assists: 0 }
      ]
    }
    // Add other teams as needed
  };

  const team = teamData[params.teamname] || teamData['uiu-tigers'];

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
                <Link href="/teams" className="text-[#D0620D] font-medium">TEAMS</Link>
                <Link href="/auction" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">AUCTION</Link>
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

      {/* Team Header */}
      <section className="pt-32 pb-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <Link href="/teams" className="text-gray-400 hover:text-white transition-colors mr-4">
              ← Back to Teams
            </Link>
          </div>
          
          <div className="text-center">
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6"
              style={{ backgroundColor: team.color }}
            >
              {team.name.substring(0, 2).toUpperCase()}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{team.name}</h1>
            <p className="text-xl text-gray-300">Captain: {team.captain} | Coach: {team.coach}</p>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-16">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">{team.wins}</div>
              <div className="text-gray-300">Wins</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">{team.losses}</div>
              <div className="text-gray-300">Losses</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">{team.goalsFor}</div>
              <div className="text-gray-300">Goals For</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">{team.goalsAgainst}</div>
              <div className="text-gray-300">Goals Against</div>
            </div>
          </div>

          {/* Budget Info */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="border border-gray-700 rounded-xl p-6" style={{ backgroundColor: '#0A0D13' }}>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Budget Status</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Total Budget:</span>
                <span className="text-white font-semibold">৳{team.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Amount Spent:</span>
                <span className="text-[#D0620D] font-semibold">৳{team.spent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Remaining:</span>
                <span className="text-green-500 font-semibold">৳{(team.budget - team.spent).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-[#D0620D]"
                  style={{ width: `${(team.spent / team.budget) * 100}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-400 text-sm mt-2">
                {((team.spent / team.budget) * 100).toFixed(1)}% of budget used
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Squad */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Squad</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.players.map((player, index) => (
              <div key={index} className="border border-gray-700 rounded-xl p-6" style={{ backgroundColor: '#0A0D13' }}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg">⚽</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{player.name}</h3>
                    <p className="text-gray-300 text-sm">{player.position}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-[#D0620D] font-semibold">৳{player.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Goals:</span>
                    <span className="text-white">{player.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assists:</span>
                    <span className="text-white">{player.assists}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Matches */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Recent Matches</h2>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            {[
              { opponent: 'UIU Eagles', result: 'W', score: '3-1', date: 'Oct 12, 2024' },
              { opponent: 'UIU Lions', result: 'W', score: '2-0', date: 'Oct 10, 2024' },
              { opponent: 'UIU Panthers', result: 'L', score: '1-2', date: 'Oct 8, 2024' },
              { opponent: 'UIU Falcons', result: 'W', score: '4-1', date: 'Oct 6, 2024' }
            ].map((match, index) => (
              <div key={index} className="flex items-center justify-between p-6 border border-gray-700 rounded-xl" style={{ backgroundColor: '#0A0D13' }}>
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    match.result === 'W' ? 'bg-green-600' : match.result === 'L' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {match.result}
                  </div>
                  <div>
                    <p className="text-white font-semibold">vs {match.opponent}</p>
                    <p className="text-gray-400 text-sm">{match.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{match.score}</p>
                </div>
              </div>
            ))}
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
