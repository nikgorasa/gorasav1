import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import GoRasaLogo from './GoRasaLogo';

const POLICY_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Refund Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'YouTube', href: '#' },
  { label: 'LinkedIn', href: '#' },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.5, ease: [0.25, 0.1, 0, 1] },
});

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
      className="relative bg-[#FDFBF7] border-t border-slate-200/70 mt-24"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-orange-500 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-slate-600 leading-snug max-w-2xl mx-auto">
            &ldquo;Travel is the only thing you buy that makes you richer&rdquo;
          </p>
          <p className="mt-4 text-[0.625rem] font-['Outfit',system-ui,sans-serif] font-extrabold tracking-[0.15em] uppercase text-orange-500">
            GoRASA: The Saffron Compass
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-16 mb-12">
          <motion.div {...fadeUp(0.1)} className="space-y-4">
            <GoRasaLogo className="h-8 w-auto" />
            <p className="text-sm text-slate-500 leading-relaxed">
              GoRASA India is a premium travel discovery platform and concierge agency.
              We offer handpicked, ultra-luxury holiday escapes, boutique stays, wellness
              dockets, and live-wholesale price aggregations across both domestic and
              international dockets. Registered under GoRASA AI Core pipelines.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.2)}>
            <h3 className="text-[0.625rem] font-['Outfit',system-ui,sans-serif] font-extrabold tracking-[0.15em] uppercase text-orange-500 mb-5">
              Policies
            </h3>
            <ul className="space-y-3">
              {POLICY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-800 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeUp(0.3)}>
            <h3 className="text-[0.625rem] font-['Outfit',system-ui,sans-serif] font-extrabold tracking-[0.15em] uppercase text-orange-500 mb-5">
              Contact
            </h3>
            <div className="space-y-4 text-sm text-slate-500">
              <div>
                <span className="block text-[0.625rem] font-medium text-slate-400 tracking-wider uppercase">
                  WhatsApp / Tel
                </span>
                <p className="mt-0.5 text-slate-700 font-medium">+91 95285 00383</p>
              </div>
              <div>
                <span className="block text-[0.625rem] font-medium text-slate-400 tracking-wider uppercase">
                  Email
                </span>
                <p className="mt-0.5">
                  <a
                    href="mailto:rasatravelindia@gmail.com"
                    className="text-slate-700 font-medium hover:text-orange-600 transition-colors"
                  >
                    rasatravelindia@gmail.com
                  </a>
                </p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our support lines are open 24/7/365, integrated directly with live GDS carrier reservation centers.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div {...fadeUp(0.35)} className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[0.625rem] font-['Outfit',system-ui,sans-serif] font-extrabold tracking-[0.15em] uppercase text-slate-400">
                Follow
              </span>
              <div className="flex items-center gap-1">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    title={s.label}
                    className="h-7 px-2.5 flex items-center gap-1 rounded-md text-[0.625rem] font-medium tracking-wide uppercase text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="text-[0.6875rem] text-slate-400 text-center md:text-right leading-relaxed">
              <p>&copy; 2026 GoRASA India Pvt. Ltd. All rights reserved. Registered central agency partners.</p>
              <p className="mt-0.5 text-slate-300 text-[0.625rem] tracking-wider uppercase font-medium">
                Secure SSL GDS Encryption Standard
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
