import React from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { 
  CheckCircle, 
  Award, 
  HelpCircle, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';

const EditorialPolicy: React.FC = () => {
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
            Standards & Guidelines
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111] leading-none font-lemon">
            Editorial Policy
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#FF4D2D]">
            Journalistic Protocol Clearance
          </p>
          <p className="text-[#555555] text-base leading-relaxed pt-2 max-w-2xl mx-auto font-medium">
            NewsPercent is guided by a commitment to fair, independent, and clear news reporting. This document outlines the rigorous protocols guiding our publishing desks.
          </p>
        </motion.section>

        {/* POLICY CARDS */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {[
            {
              title: 'Accuracy',
              icon: CheckCircle,
              desc: 'We verify every fact with primary documents, research journals, or direct interviews. Desk editors double-check claims before stories are cleared for publication.'
            },
            {
              title: 'Integrity',
              icon: Award,
              desc: 'We remain independent of political factions or corporate control. Outrage, clickbait taglines, and synthetic trends are strictly banned on our feeds.'
            },
            {
              title: 'Transparency',
              icon: HelpCircle,
              desc: 'We credit sources clearly. If a conflict of interest exists, it is explicitly declared at the header of the transmission.'
            },
            {
              title: 'AI Usage',
              icon: Cpu,
              desc: 'We use AI systems exclusively for layout optimization, spell-checking, or translation helper tasks. All reporting, interviewing, and editing are conducted by human creators.'
            },
            {
              title: 'Corrections Protocol',
              icon: RefreshCw,
              desc: 'When an error occurs, we fix it promptly. A visible notice is appended details section of the article, specifying what was changed and when.'
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

export default EditorialPolicy;
