
import React from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import GoRasaLogo from './GoRasaLogo';
import { 
  Compass, 
  Ticket, 
  MessageSquare, 
  TrendingUp, 
  LogOut,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  currentTab: 'home' | 'trips' | 'support' | 'profile' | 'admin';
  onTabChange: (tab: 'home' | 'trips' | 'support' | 'profile' | 'admin') => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick, onLogout, currentTab, onTabChange }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer gap-2" onClick={() => onTabChange('home')}>
            <GoRasaLogo className="h-9 w-auto hover:opacity-90 transition-opacity" />
            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 hover:border-orange-200 uppercase tracking-widest pl-2 ml-1 border-l">
              Travel Tech
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange('home')}
              className={`flex items-center space-x-1.3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'home' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              <Compass className="w-4 h-4 mr-0.5" />
              <motion.span
                layout
                transition={{ duration: 0.2 }}
              >Explore</motion.span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange('trips')}
              className={`flex items-center space-x-1.3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'trips' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              <Ticket className="w-4 h-4 mr-0.5" />
              <motion.span layout>Reservation Desk</motion.span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange('support')}
              className={`flex items-center space-x-1.3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'support' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-0.5" />
              <motion.span layout>AI Support Desk</motion.span>
            </motion.button>
            {user && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange('profile')}
                className={`flex items-center space-x-1.3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'profile' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                <UserCheck className="w-4 h-4 mr-0.5" />
                <motion.span layout>Profile & Loyalty</motion.span>
              </motion.button>
            )}
            {user && user.email.toLowerCase().startsWith('rasatravelindia@gmail') && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange('admin')}
                className={`flex items-center space-x-1.3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'admin' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-0.5" />
                <motion.span layout>Control Tower</motion.span>
              </motion.button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-3"
              >
                <div className="flex flex-col items-end">
                  <motion.span
                    whileHover={{ color: '#ea580c' }}
                    onClick={() => onTabChange('profile')}
                    className="text-xs font-semibold text-slate-800 cursor-pointer"
                  >{user.name}</motion.span>
                  <motion.button
                    whileHover={{ color: '#ef4444', scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="text-[10px] text-slate-400 underline uppercase tracking-widest flex items-center cursor-pointer"
                  >
                    <LogOut className="w-3 h-3 mr-0.5" />
                    Logout
                  </motion.button>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTabChange('profile')}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer"
                >
                  {user.name.charAt(0)}
                </motion.div>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={onLoginClick}
                className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 cursor-pointer"
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

