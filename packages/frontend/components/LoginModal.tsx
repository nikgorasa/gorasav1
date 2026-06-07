
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../constants';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (name: string, email: string, role: 'user' | 'corporate' | 'agent', companyName?: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'corporate' | 'agent'>('user');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      onLogin(
        name,
        email,
        role,
        (role === 'corporate' || role === 'agent') ? (companyName || (role === 'corporate' ? 'Rasa Corp Client' : 'GoRASA Travels Ltd')) : undefined
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-10 border border-slate-100">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
          <Icons.X />
        </button>

        <div className="mb-6">
          <span className="text-orange-500 font-bold uppercase tracking-widest text-[10px] bg-orange-50 px-3 py-1 rounded-full">
            GoRASA Gateway
          </span>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mt-3 mb-2">Create Your Passport</h2>
          <p className="text-slate-500 text-sm">Sign in to unlock live pricing, corporate wallets, and 2.5x premium loyalty multipliers.</p>
        </div>

        {/* Role Segmented Filter */}
        <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex space-x-1 mb-6">
          {(['user', 'corporate', 'agent'] as const).map((r) => (
            <motion.button
              key={r}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                role === r
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-orange-500'
              }`}
            >
              {r === 'user' ? 'Traveler' : r === 'corporate' ? 'Corporate' : 'B2B Agent'}
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm font-medium"
              placeholder="Alex Nomad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm font-medium"
              placeholder="alex@gorasa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {(role === 'corporate' || role === 'agent') && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                {role === 'corporate' ? 'Corporation Name' : 'Agency / Agency Name'}
              </label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder={role === 'corporate' ? 'Infosys Corporate Desk' : 'Rasa India Travels Agent'}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-xl shadow-slate-100 text-sm mt-2 cursor-pointer"
          >
            Access GoRASA Portal
          </motion.button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col items-center">
          <p className="text-xs text-slate-400 mb-3">Instant mock authentication via GoRASA ID</p>
          <div className="grid grid-cols-3 gap-2 w-full">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setName('Neha Gupta'); setEmail('neha@corp.in'); setRole('corporate'); setCompanyName('TechCorp India Pvt Ltd'); }}
              className="py-2 border border-slate-200 hover:border-orange-200 hover:bg-orange-50/20 rounded-xl text-[10px] font-bold text-slate-600 transition-colors text-center leading-tight cursor-pointer"
            >
              Corp Demo
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setName('Rahul Verma'); setEmail('sales@gorasa.in'); setRole('agent'); setCompanyName('GoRASA Sales'); }}
              className="py-2 border border-slate-200 hover:border-orange-200 hover:bg-orange-50/20 rounded-xl text-[10px] font-bold text-slate-600 transition-colors text-center leading-tight cursor-pointer"
            >
              Agent Demo
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setName('Harsh Mittal'); setEmail('hmittal@gorasa.in'); setRole('agent'); setCompanyName('GoRASA Admin'); }}
              className="py-2 border border-orange-200 bg-orange-500/5 text-orange-600 hover:bg-orange-500/10 rounded-xl text-[10px] font-bold transition-colors text-center leading-tight cursor-pointer"
            >
              Admin Demo
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;

