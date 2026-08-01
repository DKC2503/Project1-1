import React from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { 
  Shield, 
  Eye, 
  Lock, 
  UserCheck, 
  Database, 
  FileText 
} from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
            Privacy & Trust
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111] leading-none font-lemon">
            Privacy Policy
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#FF4D2D]">
            Data Clearance & Protocols
          </p>
          <p className="text-[#555555] text-base leading-relaxed pt-2 max-w-2xl mx-auto font-medium">
            This policy outlines how NewsPercent handles your data when accessing our public news network, newsletter services, and analytics frameworks.
          </p>
        </motion.section>

        {/* POLICY CARDS */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {[
            {
              title: 'Information We Collect',
              icon: Database,
              desc: 'We collect browser data, geolocated coordinates (for local weather/commodity rates), anonymous analytics page views, and voluntarily submitted emails for newsletters.'
            },
            {
              title: 'Data Usage Protocols',
              icon: Eye,
              desc: 'Data is strictly used to serve geolocated dashboard metrics, track aggregate readership analytics, maintain platform security, and transmit subscribed news alerts.'
            },
            {
              title: 'Security Standards',
              icon: Lock,
              desc: 'All connections are encrypted over secure SSL channels. Client profiles and database shards are stored behind firewalls to prevent unauthorized intrusion.'
            },
            {
              title: 'Third-Party Cookies',
              icon: Shield,
              desc: 'We use cookies to maintain analytics sessions and cache exchange/precious metals rates. Third-party advertising partners may place cookies for conversion metrics.'
            },
            {
              title: 'User Clearance & Rights',
              icon: UserCheck,
              desc: 'Users can opt out of analytical tracking, cancel newsletter subscriptions at any time, or request the complete removal of their credentials from our databases.'
            },
            {
              title: 'Policy Revisions',
              icon: FileText,
              desc: 'We update our policy to reflect technology upgrades. Continued use of our nodes implies agreement to current privacy protocol updates.'
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

export default PrivacyPolicy;
