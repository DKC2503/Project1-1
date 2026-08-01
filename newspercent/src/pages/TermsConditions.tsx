import React from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { 
  FileText, 
  ShieldAlert, 
  HelpCircle, 
  Scale, 
  Globe 
} from 'lucide-react';

const TermsConditions: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-manrope selection:bg-[#F5D76E]/40">
      <SiteHeader />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-8 space-y-16"
      >
        {/* HERO TITLE */}
        <motion.section variants={itemVariants} className="text-center space-y-4 max-w-3xl mx-auto mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4D2D]/10 border border-[#FF4D2D]/20 text-xs font-black tracking-widest uppercase text-[#FF4D2D]">
            Legal Protocol
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111] leading-none font-lemon">
            Terms & Conditions
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#FF4D2D]">
            Service Agreement Protocols
          </p>
          <p className="text-[#555555] text-base leading-relaxed pt-2 max-w-2xl mx-auto font-medium">
            Please read these terms and conditions carefully before accessing the public terminals, services, and feeds operated by NewsPercent.
          </p>
        </motion.section>

        {/* POLICY CARDS */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {[
            {
              title: 'Agreement to Terms',
              icon: FileText,
              desc: 'By accessing or reading any article node on newspercent.com, you agree to comply with and be bound by these service conditions.'
            },
            {
              title: 'Intellectual Property',
              icon: ShieldAlert,
              desc: 'All logos, layouts, charts, weather summaries, population trackers, database codes, and written articles are the exclusive property of NewsPercent.'
            },
            {
              title: 'User Restrictions',
              icon: HelpCircle,
              desc: 'Users are prohibited from using web-scraping scripts, automated traffic bots, or security-penetration scripts against our servers or endpoints.'
            },
            {
              title: 'Disclaimers of Liability',
              icon: Scale,
              desc: 'NewsPercent updates gold/silver spot prices and local petrol rates dynamically. However, commodity statistics and weather indicators are for reference only and not investment advice.'
            },
            {
              title: 'Governing Law',
              icon: Globe,
              desc: 'Any dispute, litigation, or claim arising from these terminal connections shall be governed by and constructed in accordance with the laws of India.'
            }
          ].map((topic) => (
            <div key={topic.title} className="bg-white p-8 rounded-[2rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:border-[#FF4D2D]/20 transition-all duration-300 flex gap-6 items-start">
              <div className="p-3 bg-[#FF4D2D]/10 rounded-xl text-[#FF4D2D] shrink-0">
                <topic.icon className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold uppercase tracking-tight text-[#111111]">{topic.title}</h3>
                <p className="text-xs text-[#555555] leading-relaxed font-medium">{topic.desc}</p>
              </div>
            </div>
          ))}
        </motion.section>

        {/* SUBTLE FOOTER */}
        <motion.section variants={itemVariants} className="pt-6 border-t border-[#E5E7EB] text-center">
          <p className="text-[10px] font-black uppercase text-[#555555] tracking-widest">
            Last Updated: 26 June 2026
          </p>
        </motion.section>

      </motion.main>

      <Footer />
    </div>
  );
};

export default TermsConditions;
