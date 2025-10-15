import Image from 'next/image';
import Link from 'next/link';

export default function Teams() {
  const teams = [
    { name: 'UIU Tigers', players: 17, captain: 'Rafiqul Islam', color: '#D0620D', wins: 5, losses: 2 },
    { name: 'UIU Eagles', players: 17, captain: 'Aminul Haque', color: '#3B82F6', wins: 4, losses: 3 },
    { name: 'UIU Lions', players: 17, captain: 'Shahidul Rahman', color: '#10B981', wins: 6, losses: 1 },
    { name: 'UIU Panthers', players: 17, captain: 'Mahbubur Rahman', color: '#EF4444', wins: 3, losses: 4 },
    { name: 'UIU Falcons', players: 17, captain: 'Tanvir Ahmed', color: '#8B5CF6', wins: 4, losses: 3 },
    { name: 'UIU Wolves', players: 17, captain: 'Nasir Uddin', color: '#F59E0B', wins: 5, losses: 2 },
    { name: 'UIU Hawks', players: 17, captain: 'Karim Hassan', color: '#6366F1', wins: 2, losses: 5 },
    { name: 'UIU Phoenix', players: 17, captain: 'Farhan Ali', color: '#EC4899', wins: 3, losses: 4 }
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

      {/* Header */}
      <section className="pt-32 pb-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Tournament <span className="text-[#D0620D]">Teams</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet the 8 competing teams in the UIU VC Cup Football Tournament. Each team consists of 17 skilled players ready to battle for the championship.
            </p>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teams.map((team, index) => (
              <Link key={index} href={`/teams/${team.name.toLowerCase().replace(' ', '-')}`} className="block">
                <div className="rounded-xl p-8 border border-gray-600 hover:border-[#D0620D] transition-all duration-300 cursor-pointer hover:scale-105" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{team.name}</h3>
                    <p className="text-gray-300 mb-4">Captain: {team.captain}</p>
                    <div className="flex justify-between text-sm text-gray-400 mb-4">
                      <span>{team.players} Players</span>
                      <span>{team.wins}W - {team.losses}L</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: team.color,
                          width: `${(team.wins / (team.wins + team.losses)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Win Rate</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Stats */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Tournament Statistics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">8</div>
              <div className="text-gray-300">Teams</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">136</div>
              <div className="text-gray-300">Total Players</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">28</div>
              <div className="text-gray-300">Matches Played</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#D0620D]">Live</div>
              <div className="text-gray-300">Tournament</div>
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
