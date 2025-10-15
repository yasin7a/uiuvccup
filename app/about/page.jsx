import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  const features = [
    {
      icon: '🏆',
      title: 'Tournament Management',
      description: 'Complete tournament management system with real-time updates and comprehensive statistics.'
    },
    {
      icon: '⚽',
      title: 'Player Auction',
      description: 'Interactive live auction system where teams bid for players to build their dream squads.'
    },
    {
      icon: '📊',
      title: 'Live Statistics',
      description: 'Real-time match statistics, player performance tracking, and detailed analytics.'
    },
    {
      icon: '🎯',
      title: 'Team Building',
      description: 'Strategic team formation with budget management and player category requirements.'
    }
  ];

  const organizers = [
    {
      name: 'UIU Sports Committee',
      role: 'Tournament Organizer',
      description: 'Responsible for overall tournament planning and execution.'
    },
    {
      name: 'UIU VC Office',
      role: 'Official Sponsor',
      description: 'Providing official support and championship prizes.'
    },
    {
      name: 'UIU IT Department',
      role: 'Technical Support',
      description: 'Managing the digital platform and live streaming services.'
    }
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
                <Link href="/auction" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">AUCTION</Link>
                <Link href="/about" className="text-[#D0620D] font-medium">ABOUT</Link>
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
              About <span className="text-[#D0620D]">UIU VC Cup</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              The UIU VC Cup Football Tournament is an innovative sports event that combines traditional football competition with modern auction-based team building, creating an exciting and strategic tournament experience.
            </p>
          </div>
        </div>
      </section>

      {/* Tournament Overview */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Tournament Overview</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  The UIU VC Cup is a unique football tournament that brings together 136 talented players across 8 competitive teams. What makes this tournament special is our innovative auction system, where team captains bid for players to build their ultimate squad.
                </p>
                <p>
                  Each team starts with an equal budget and must strategically acquire players across different positions - goalkeepers, defenders, midfielders, and forwards. This creates an exciting dynamic where team building strategy is just as important as on-field performance.
                </p>
                <p>
                  The tournament features live streaming, real-time statistics, and an interactive platform that allows fans to follow every moment of the action, from the auction room to the final whistle.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-96 h-96 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700">
                <div className="text-8xl">🏆</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Tournament Features</h2>
            <p className="text-xl text-gray-300">What makes UIU VC Cup special</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 border border-gray-700 rounded-xl" style={{ backgroundColor: '#0A0D13' }}>
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Rules */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Tournament Rules</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-700 rounded-xl p-8" style={{ backgroundColor: '#0A0D13' }}>
              <h3 className="text-2xl font-bold text-[#D0620D] mb-4">Auction Rules</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• Each team gets an equal budget of ₹2,50,000</li>
                <li>• Teams must acquire exactly 17 players</li>
                <li>• Minimum 2 goalkeepers, 5 defenders, 5 midfielders, 5 forwards</li>
                <li>• Live bidding with 60-second timer per player</li>
                <li>• No team can exceed their budget limit</li>
              </ul>
            </div>
            
            <div className="border border-gray-700 rounded-xl p-8" style={{ backgroundColor: '#0A0D13' }}>
              <h3 className="text-2xl font-bold text-[#D0620D] mb-4">Match Rules</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• Standard FIFA football rules apply</li>
                <li>• 90-minute matches with 15-minute halves</li>
                <li>• Round-robin format followed by knockout</li>
                <li>• Fair play points system in effect</li>
                <li>• Live streaming of all matches</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Organizers */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Organized By</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {organizers.map((org, index) => (
              <div key={index} className="text-center p-8 border border-gray-700 rounded-xl" style={{ backgroundColor: '#0A0D13' }}>
                <div className="w-16 h-16 bg-[#D0620D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{org.name.substring(0, 2)}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{org.name}</h3>
                <p className="text-[#D0620D] font-semibold mb-3">{org.role}</p>
                <p className="text-gray-300">{org.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16" style={{ backgroundColor: '#0A0D13' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Get Involved</h2>
          <p className="text-xl text-gray-300 mb-8">
            Interested in participating or sponsoring the UIU VC Cup? Contact us to learn more about opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#D0620D] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#B8540B] transition-colors">
              Contact Organizers
            </button>
            <button className="border-2 border-[#D0620D] text-[#D0620D] px-8 py-3 rounded-lg font-semibold hover:bg-[#D0620D] hover:text-white transition-colors">
              Become a Sponsor
            </button>
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
