import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
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
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                {/* <span className="text-xl font-bold text-black">
                  UIU VC Cup
                </span> */}
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">HOME</Link>
                <Link href="/teams" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">TEAMS</Link>
                <Link href="/auction" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">AUCTION</Link>
                <Link href="/about" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">ABOUT</Link>
                {/* <Link href="/blog" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">BLOG</Link> */}
                <Link 
                  href="/login" 
                  className="bg-[#D0620D] px-6 py-2 rounded-full text-white font-medium hover:bg-[#B8540B] transition-all duration-300"
                >
                  LOGIN
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-gray-700 hover:text-[#D0620D] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/assets/herobg.png" 
            alt="Football Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full pt-20">
          <div className="flex items-center min-h-screen pl-8 lg:pl-16">
            <div className="space-y-6 max-w-3xl">
              {/* Top Event Badge */}
              <div className="inline-flex items-center space-x-2 border border-gray-600 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium uppercase tracking-wider">All Teams</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                  <span className="block text-white">YOUR GAME</span>
                  <span className="block text-[#D0620D]">YOUR PASSION</span>
                  <span className="block text-white">YOUR KICK.</span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
                Stay ahead with the latest football tournament action, live scores, and in-depth match analysis — all in one place with{' '}
                <span className="text-[#D0620D] font-semibold">UIU VC Cup</span>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2">
                  <span>Explore Teams</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* <button className="border-2 border-[#D0620D] text-[#D0620D] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#D0620D] hover:text-white transition-all duration-300">
                  Join Tournament
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Teams Bar */}
        <div className="absolute bottom-0 left-0 w-full">
          <div className="backdrop-blur-sm border-t border-gray-800" style={{ backgroundColor: '#0A0D13' }}>
            <div className="flex items-center h-20 overflow-hidden">
              {/* Tournament Label */}
              <div className="flex-shrink-0 bg-[#D0620D] px-6 py-4 h-full flex flex-col justify-center min-w-[120px]">
                <div className="text-white font-bold text-lg leading-tight">TOURNAMENT</div>
                <div className="text-orange-200 text-sm font-medium">TEAMS</div>
              </div>

              {/* Teams Grid */}
              <div className="flex-1 grid grid-cols-8 h-full">
                {/* Team 1 - Fire Cats */}
                <div className="border-r border-gray-700 px-4 py-3 flex flex-col justify-center hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-white text-xs font-semibold mb-1">UIU TIGERS</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#D0620D] rounded-full"></div>
                    <span className="text-white text-sm font-bold">UT</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">17 Players</div>
                </div>

                {/* Team 2 - Thunder */}
                <div className="border-r border-gray-700 px-4 py-3 flex flex-col justify-center hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-white text-xs font-semibold mb-1">UIU EAGLES</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-white text-sm font-bold">UE</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">17 Players</div>
                </div>

                {/* Team 3 - Storm */}
                <div className="border-r border-gray-700 px-4 py-3 flex flex-col justify-center hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-white text-xs font-semibold mb-1">UIU LIONS</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white text-sm font-bold">UL</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">17 Players</div>
                </div>

                {/* Team 4 - Lions */}
                <div className="border-r border-gray-700 px-4 py-3 flex flex-col justify-center hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-white text-xs font-semibold mb-1">UIU PANTHERS</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-white text-sm font-bold">UP</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">17 Players</div>
                </div>

                {/* Team 5 - Eagles */}
                <div className="border-r border-gray-700 px-4 py-3 flex flex-col justify-center hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-white text-xs font-semibold mb-1">UIU FALCONS</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-white text-sm font-bold">UF</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">17 Players</div>
                </div>

                {/* Team 6 - Tigers */}
                <div className="border-r border-gray-700 px-4 py-3 flex flex-col justify-center hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-white text-xs font-semibold mb-1">UIU WOLVES</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-white text-sm font-bold">UW</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">17 Players</div>
                </div>

                {/* Team 7 - Wolves */}
                <div className="border-r border-gray-700 px-4 py-3 flex flex-col justify-center hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-white text-xs font-semibold mb-1">UIU HAWKS</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-white text-sm font-bold">UH</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">17 Players</div>
                </div>

                {/* Team 8 - Phoenix */}
                <div className="px-4 py-3 flex flex-col justify-center hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-white text-xs font-semibold mb-1">UIU PHOENIX</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-white text-sm font-bold">UX</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">17 Players</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#D0620D] rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-[#D0620D] rounded-full animate-pulse delay-1000"></div>
      </section>

      {/* Auction Status Section */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Live Auction Status</h2>
            <p className="text-xl text-gray-300">Current bidding round and team selections</p>
          </div>
          
          <div className="rounded-2xl p-8 border border-gray-700" style={{ backgroundColor: '#0A0D13' }}>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="rounded-xl p-6 shadow-sm border border-gray-600" style={{ backgroundColor: '#0A0D13' }}>
                <div className="text-3xl font-bold text-[#D0620D] mb-2">Round 3</div>
                <div className="text-gray-300">Current Auction Round</div>
              </div>
              <div className="rounded-xl p-6 shadow-sm border border-gray-600" style={{ backgroundColor: '#0A0D13' }}>
                <div className="text-3xl font-bold text-[#D0620D] mb-2">৳4,500</div>
                <div className="text-gray-300">Highest Bid</div>
              </div>
              <div className="rounded-xl p-6 shadow-sm border border-gray-600" style={{ backgroundColor: '#0A0D13' }}>
                <div className="text-3xl font-bold text-[#D0620D] mb-2">2:45</div>
                <div className="text-gray-300">Time Remaining</div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button className="bg-[#D0620D] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#B8540B] transition-colors">
                Join Live Auction
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Teams Overview */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Tournament Teams</h2>
            <p className="text-xl text-gray-300">8 teams competing for the championship</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'UIU Tigers', players: 17, budget: '৳25,000', color: '#D0620D' },
              { name: 'UIU Eagles', players: 17, budget: '৳25,000', color: '#3B82F6' },
              { name: 'UIU Lions', players: 17, budget: '৳25,000', color: '#10B981' },
              { name: 'UIU Panthers', players: 17, budget: '৳25,000', color: '#EF4444' },
              { name: 'UIU Falcons', players: 17, budget: '৳25,000', color: '#8B5CF6' },
              { name: 'UIU Wolves', players: 17, budget: '৳25,000', color: '#F59E0B' },
              { name: 'UIU Hawks', players: 17, budget: '৳25,000', color: '#6366F1' },
              { name: 'UIU Phoenix', players: 17, budget: '৳25,000', color: '#EC4899' }
            ].map((team, index) => (
              <Link key={index} href={`/teams/${team.name.toLowerCase().replace(' ', '-')}`} className="block">
                <div className="rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-600 hover:border-[#D0620D] cursor-pointer" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-bold text-white">{team.name}</h3>
                      <p className="text-sm text-gray-300">{team.players} Players</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Player Categories */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Player Categories</h2>
            <p className="text-xl text-gray-300">Different player types and their base prices</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { category: 'Goalkeeper', count: 16, basePrice: '৳1,500', icon: '🥅' },
              { category: 'Defender', count: 40, basePrice: '৳1,200', icon: '🛡️' },
              { category: 'Midfielder', count: 48, basePrice: '৳1,800', icon: '⚽' },
              { category: 'Forward', count: 32, basePrice: '৳2,000', icon: '🎯' }
            ].map((category, index) => (
              <Link key={index} href={`/players/${category.category.toLowerCase()}`} className="block">
                <div className="rounded-xl p-6 text-center border border-gray-700 hover:border-[#D0620D] transition-all duration-300 cursor-pointer hover:scale-105" style={{ backgroundColor: '#0A0D13' }}>
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{category.category}</h3>
                  <p className="text-gray-300">{category.count} Available</p>
                </div>
              </Link>
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
