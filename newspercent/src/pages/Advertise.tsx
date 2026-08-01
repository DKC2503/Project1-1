import React from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { 
  Megaphone, 
  Target, 
  BarChart2, 
  Mail, 
  Globe, 
  Coins, 
  Sparkles 
} from 'lucide-react';

const Advertise: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
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
        className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-20"
      >
        {/* HERO TITLE */}
        <motion.section variants={itemVariants} className="text-center space-y-4 max-w-3xl mx-auto mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4D2D]/10 border border-[#FF4D2D]/20 text-xs font-black tracking-widest uppercase text-[#FF4D2D]">
            Grow Your Brand
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111111] leading-none font-lemon">
            Partner With NewsPercent
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#FF4D2D]">
            Advertising & Media Kit
          </p>
          <p className="text-[#555555] text-base leading-relaxed pt-2 max-w-2xl mx-auto font-medium">
            Connect with a highly engaged, digital-first audience. Tap into South India's premier youth-led news intelligence platform to deliver your brand message effectively.
          </p>
        </motion.section>

        {/* AUDIENCE & METRICS SUMMARY */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { value: '1.2M+', label: 'Monthly Readers', desc: 'Highly engaged demographics across South India and beyond.' },
            { value: '72%', label: 'Youth Demographic', desc: 'Ages 18–34, active students, innovators, and young professionals.' },
            { value: '4.8 Min', label: 'Average Read Time', desc: 'In-depth engagement across structured analyses and studies.' }
          ].map((metric) => (
            <div key={metric.label} className="bg-white p-8 rounded-[2rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.01)] text-center space-y-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5D76E]/10 rounded-full blur-2xl group-hover:bg-[#F5D76E]/20 transition-colors" />
              <span className="text-4xl font-extrabold text-[#FF4D2D] block font-lemon leading-none">{metric.value}</span>
              <h4 className="text-sm font-extrabold uppercase text-[#111111]">{metric.label}</h4>
              <p className="text-xs text-[#555555] leading-relaxed">{metric.desc}</p>
            </div>
          ))}
        </motion.section>

        {/* ADVERTISING OPPORTUNITIES */}
        <motion.section variants={itemVariants} className="space-y-8">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
            <Megaphone className="w-6 h-6 text-[#FF4D2D]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-[#111111]">Advertising Opportunities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Sponsored Briefings',
                icon: Sparkles,
                desc: 'Integrate native, editorial-quality content directly into our feeds. Co-authored by desk editors, highlighting your startup story, technology launch, or corporate initiative.'
              },
              {
                title: 'High-Impact Banners',
                icon: Target,
                desc: 'Premium banner placements across our header, article sidebars, and homepage sections designed to achieve maximum visibility on both desktop and mobile devices.'
              },
              {
                title: 'Newsletter Sponsorship',
                icon: Mail,
                desc: 'Feature your product, event, or announcement directly inside the daily NewsPercent morning brief, delivered directly to active subscriber mailboxes.'
              },
              {
                title: 'Custom Case Studies',
                icon: BarChart2,
                desc: 'Engage our research desks to compile and publish in-depth analytical reviews and reports focusing on industries, market structures, or product breakthroughs.'
              }
            ].map((opp) => (
              <div key={opp.title} className="bg-white p-8 rounded-[2rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex gap-6 items-start">
                <div className="p-4 bg-[#FF4D2D]/10 rounded-2xl text-[#FF4D2D] shrink-0">
                  <opp.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-extrabold uppercase text-[#111111]">{opp.title}</h4>
                  <p className="text-xs text-[#555555] leading-relaxed font-medium">{opp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* BENEFITS */}
        <motion.section variants={itemVariants} className="space-y-8">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
            <Coins className="w-6 h-6 text-[#FF4D2D]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-[#111111]">Why Partner with Us?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'South India Focus',
                desc: 'Direct channels targeting young readers across Andhra Pradesh, Telangana, Tamil Nadu, and Karnataka.'
              },
              {
                title: 'Credible Environment',
                desc: 'Your brand sits alongside structured fact-checked briefings and youth perspectives, avoiding sensationalized outrage.'
              },
              {
                title: 'Performance Tethers',
                desc: 'Receive transparent engagement analytics reporting, tracking active impressions, reads, and CTRs.'
              }
            ].map((benefit) => (
              <div key={benefit.title} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.01)] space-y-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D2D] block" />
                <h4 className="text-sm font-extrabold uppercase text-[#111111]">{benefit.title}</h4>
                <p className="text-xs text-[#555555] leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* BUSINESS CONTACT */}
        <motion.section variants={itemVariants} className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5D76E]/10 rounded-full blur-3xl" />
          
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest block">Secure Inquiries</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-[#111111]">Advertising & Sponsorship Contact</h3>
            <p className="text-xs text-[#555555] leading-relaxed font-medium">
              Ready to construct a partnership? Submit your proposal, target demographics, and budgets to our corporate desks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <a 
              href="mailto:adminnewspercent@gmail.com?subject=Advertising Inquiry" 
              className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#FF4D2D]/30 hover:bg-[#FF4D2D]/5 transition-all group"
            >
              <div className="p-3 bg-[#FF4D2D]/10 rounded-xl text-[#FF4D2D] group-hover:bg-[#FF4D2D] group-hover:text-white transition-all shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-[#555555] tracking-widest block">Email Address</span>
                <span className="text-xs font-extrabold text-[#111111] lowercase truncate">adminnewspercent@gmail.com</span>
              </div>
            </a>

            <a 
              href="https://newspercent.com" 
              className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#F5D76E]/40 hover:bg-[#F5D76E]/5 transition-all group"
            >
              <div className="p-3 bg-[#F5D76E]/20 rounded-xl text-[#9B7C1C] group-hover:bg-[#F5D76E] group-hover:text-white transition-all shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-[#555555] tracking-widest block">Corporate Page</span>
                <span className="text-xs font-extrabold text-[#111111]">newspercent.com</span>
              </div>
            </a>
          </div>
        </motion.section>

      </motion.main>

      <Footer />
    </div>
  );
};

export default Advertise;
