import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import {
  WrenchIcon,
  CurrencyDollarIcon,
  UsersIcon,
  HomeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const Home = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: HomeIcon,
      title: 'Garage Manager',
      description: 'Organize your entire collection. Track every vehicle, modification, and milestone in one place.',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10',
      iconColor: '#e45a41',
    },
    {
      icon: WrenchIcon,
      title: 'Maintenance Tracker',
      description: 'Never miss an oil change or service. Log repairs, track costs, and maintain your ride perfectly.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      iconColor: '#3b82f6',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Marketplace',
      description: 'Buy and sell vehicles with confidence. Connect with enthusiasts and find your next project.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      iconColor: '#10b981',
    },
    {
      icon: UsersIcon,
      title: 'Social Hub',
      description: 'Explore epic builds, share your journey, and connect with fellow car enthusiasts worldwide.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      iconColor: '#a855f7',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(228,90,65,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        </div>

        {/* Floating Particles Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Badge */}
          <div
            className={`inline-block mb-8 transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg shadow-red-500/50">
              Built for Car Enthusiasts
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className={`text-5xl md:text-7xl font-extrabold mb-6 transform transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span className="text-white block mb-2">Your Garage,</span>
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-gradient">
              Your Journey
            </span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            The all-in-one platform for managing your collection, tracking maintenance, 
            buying & selling, and connecting with the car community.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <button
              onClick={() => navigate(session ? '/garage' : '/signup')}
              className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Explore Builds
            </button>
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-3 gap-8 mt-16 transform transition-all duration-1000 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {[
              { label: 'Vehicles Tracked', value: '10K+' },
              { label: 'Active Users', value: '5K+' },
              { label: 'Builds Shared', value: '25K+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-gray-900 to-black dark:from-black dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              One platform to manage, track, buy, sell, and share your passion for cars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8" style={{ color: feature.iconColor }} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Car Enthusiasts Choose Drivn
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Detailed maintenance logs',
              'Cost tracking & analytics',
              'Photo galleries for each vehicle',
              'Q&A with the community',
              'Discussion forums',
              'Marketplace integration',
              'Build timeline visualization',
              'Export your data anytime',
              'Mobile-friendly design',
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-red-500/50 transition-all duration-300"
              >
                <CheckCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of car enthusiasts managing their builds, tracking maintenance, 
            and sharing their passion.
          </p>
          <button
            onClick={() => navigate(session ? '/garage' : '/signup')}
            className="group px-10 py-5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105 text-lg flex items-center gap-2 mx-auto"
          >
            Join Drivn Today
            <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 text-center py-8 border-t border-gray-800">
        <p>&copy; 2025 Drivn. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
