import React from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { 
  Target, 
  Award, 
  TrendingUp, 
  Users, 
  Handshake, 
  Compass, 
  MessageSquare,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import { 
  FaInstagram, 
  FaYoutube, 
  FaFacebook, 
  FaLinkedin, 
  FaReddit, 
  FaDiscord, 
  FaQuora, 
  FaTelegram, 
  FaWhatsapp 
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/news_percent?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  youtube: "https://youtube.com/@newspercent?si=MSijbFoZuTzZ_UfA",
  twitter: "https://x.com/NewspercentNews?s=20",
  facebook: "https://facebook.com/newspercent",
  linkedin: "https://linkedin.com/company/newspercent",
  reddit: "https://reddit.com/r/newspercent",
  discord: "https://discord.gg/newspercent",
  quora: "https://quora.com/q/newspercent",
  telegram: "https://t.me/newspercent",
  whatsapp: "https://whatsapp.com/channel/0029VayEkt9BKfhrtE3ncR2H"
};

const About: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-manrope selection:bg-[#F5D76E]/40">
      <SiteHeader />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-24"
      >
        {/* HERO SECTION */}
        <motion.section variants={itemVariants} className="text-center space-y-6 max-w-4xl mx-auto mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5D76E]/15 border border-[#F5D76E]/30 text-xs font-black tracking-widest uppercase text-[#9B7C1C]">
            About NewsPercent (N%)
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#111111] leading-tight font-lemon">
            South India's First <span className="text-[#FF4D2D]">Youth-Led</span> Digital News Network
          </h1>
          <p className="text-lg sm:text-xl font-bold uppercase tracking-widest text-[#FF4D2D] italic">
            A Movement Against Noisy Media
          </p>
          <p className="text-[#555555] text-base sm:text-lg leading-relaxed pt-4 font-medium max-w-3xl mx-auto">
            NewsPercent (N%) is a modern digital news platform founded by young creators who believe journalism should be clear, meaningful, and accessible to everyone. In a world flooded with endless headlines, misinformation, and sensationalism, our mission is to deliver news that informs, explains, and inspires.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#555555] text-sm leading-relaxed text-left max-w-3xl mx-auto pt-6 border-t border-[#E5E7EB] mt-8">
            <p>
              We combine responsible journalism, modern storytelling, technology, and community-driven reporting to help readers understand not only what is happening, but also why it matters.
            </p>
            <p>
              Our goal is simple: to create a trusted digital platform where facts matter, young voices are heard, and meaningful conversations thrive.
            </p>
          </div>
        </motion.section>

        {/* MISSION & VALUES */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Mission */}
          <div className="lg:col-span-5 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D2D]/5 rounded-full blur-3xl group-hover:bg-[#FF4D2D]/10 transition-colors" />
            <div className="space-y-6">
              <div className="p-4 bg-[#FF4D2D]/10 rounded-2xl w-14 h-14 flex items-center justify-center">
                <Target className="w-6 h-6 text-[#FF4D2D]" />
              </div>
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[#111111]">Our Mission</h2>
              <p className="text-[#555555] text-sm leading-relaxed">
                To make reliable information accessible to the next generation through a forward-looking digital ecosystem.
              </p>
              <ul className="space-y-3 pt-4">
                {[
                  'Clear reporting',
                  'Responsible journalism',
                  'Meaningful storytelling',
                  'Youth-driven perspectives',
                  'Digital-first innovation',
                  'Community engagement',
                  'Technology-enabled media'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#555555]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D2D]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Core Values */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5D76E]/10 rounded-full blur-3xl group-hover:bg-[#F5D76E]/20 transition-colors" />
            <div className="space-y-6">
              <div className="p-4 bg-[#F5D76E]/20 rounded-2xl w-14 h-14 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#9B7C1C]" />
              </div>
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[#111111]">Our Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {[
                  { title: 'Truth Before Trends', desc: 'Accuracy always comes before attention.' },
                  { title: 'Clarity Over Noise', desc: 'We prioritize understanding over sensationalism.' },
                  { title: 'Editorial Integrity', desc: 'Professionalism guides every story we publish.' },
                  { title: 'Innovation In Media', desc: 'We embrace technology and modern storytelling.' },
                  { title: 'Community First', desc: 'Readers remain at the center of everything we do.' },
                  { title: 'Consistency Builds Trust', desc: 'Trust is earned through responsible journalism.' },
                  { title: 'Learning Through Analysis', desc: 'Knowledge grows when information is paired with understanding and context.' }
                ].map((value) => (
                  <div key={value.title} className="space-y-1">
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#111111]">{value.title}</h4>
                    <p className="text-xs text-[#555555] leading-relaxed">{value.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* WHAT MAKES US DIFFERENT */}
        <motion.section variants={itemVariants} className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">What Makes Us Different</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF4D2D]">Pioneering a new standard for modern journalism</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4">
              <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest">01 / Perspective</span>
              <h3 className="text-xl font-extrabold uppercase text-[#111111]">Youth-Led</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                NewsPercent is built and operated by a new generation of creators, analysts, editors, researchers, and innovators who understand the interests, challenges, and aspirations of today's youth.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4">
              <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest">02 / Integrity</span>
              <h3 className="text-xl font-extrabold uppercase text-[#111111]">Clarity Over Noise</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                We focus on facts, context, and understanding rather than sensationalism, misinformation, and clickbait.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4">
              <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest">03 / Breadth</span>
              <h3 className="text-xl font-extrabold uppercase text-[#111111]">Multi-Category</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                We cover India, World, Technology, Business, Sports, Automobiles, Lifestyle, Movies, Startups, Studies, and Case Studies, keeping readers thoroughly informed.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4">
              <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest">04 / Format</span>
              <h3 className="text-xl font-extrabold uppercase text-[#111111]">Modern Storytelling</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                We make complex topics easier to understand through structured, reader-friendly, mobile-first content designed for today's digital audience.
              </p>
            </div>
          </div>
        </motion.section>

        {/* N% INSIGHTS & COMMUNITY */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Insights */}
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[#FF4D2D]" />
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111]">N% Insights</h3>
              </div>
              <p className="text-[#555555] text-sm leading-relaxed">
                At NewsPercent, we continuously monitor and analyze the key trends shaping our world:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Emerging trends', 'Public conversations', 'Technology shifts', 
                  'Startup ecosystems', 'Youth interests', 'Educational developments', 
                  'Global events', 'Policy discussions', 'Innovation landscapes'
                ].map((item) => (
                  <span key={item} className="px-3 py-1.5 bg-[#F3F4F6] border border-[#E5E7EB] text-[10px] font-bold uppercase tracking-wider text-[#555555] rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-[#555555] font-bold uppercase tracking-widest border-t border-[#E5E7EB] pt-4 mt-6">
              Objective: To understand the larger conversations shaping the future.
            </p>
          </div>

          {/* Community */}
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#FF4D2D]" />
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111]">Our Community</h3>
              </div>
              <p className="text-[#555555] text-sm leading-relaxed">
                NewsPercent is more than a news platform. We are building a growing community of people who value understanding over outrage and facts over noise:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  'Students', 'Professionals', 'Entrepreneurs', 
                  'Creators', 'Researchers', 'Future Leaders'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#111111]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5D76E]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed border-t border-[#E5E7EB] pt-4 mt-6">
              Every article, discussion, and collaboration contributes to a stronger, more informed community.
            </p>
          </div>
        </motion.section>

        {/* COLLABORATIONS & VISION 2030 */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Collaborate */}
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Handshake className="w-5 h-5 text-[#FF4D2D]" />
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111]">Collaborate With Us</h3>
              </div>
              <p className="text-[#555555] text-sm leading-relaxed">
                We welcome collaborations with individuals and organizations who align with our vision:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Influencers', 'Content Creators', 'Startups', 
                  'Educational Institutions', 'Student Communities', 
                  'Industry Experts', 'Organizations'
                ].map((item) => (
                  <span key={item} className="px-3.5 py-1.5 bg-[#FF4D2D]/5 border border-[#FF4D2D]/15 text-[10px] font-black uppercase tracking-wider text-[#FF4D2D] rounded-xl">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs font-medium text-[#555555] leading-relaxed pt-6 border-t border-[#E5E7EB] mt-8">
              If you have ideas, stories, opportunities, or initiatives that align with our vision, we would love to hear from you.
            </p>
          </div>

          {/* Vision 2030 */}
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-[#FF4D2D]" />
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111]">Our Vision 2030</h3>
              </div>
              <p className="text-[#555555] text-sm leading-relaxed">
                Our long-term vision is to establish NewsPercent as one of India's most trusted youth-led digital media platforms.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 pt-2">
                {[
                  'Building a strong national readership',
                  'Expanding into video journalism',
                  'Launching original documentaries',
                  'Developing AI-assisted newsrooms',
                  'Creating educational content',
                  'Supporting young journalists',
                  'Building creator partnerships',
                  'Growing a global audience',
                  'Becoming a recognized brand'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-[#555555] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D2D] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* CONNECT & SOCIALS SECTION */}
        <motion.section variants={itemVariants} className="bg-white p-8 sm:p-16 rounded-[3rem] border border-[#E5E7EB] shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5D76E]/10 rounded-full blur-3xl" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact details */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest">Connect Directly</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111111]">Contact NewsPercent</h2>
              <p className="text-xs text-[#555555] leading-relaxed max-w-sm">
                We value meaningful conversations, collaboration opportunities, story ideas, partnerships, and community engagement.
              </p>
              
              <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                <a href="https://newspercent.com" className="flex items-center gap-3.5 text-sm font-bold uppercase tracking-widest text-[#111111] hover:text-[#FF4D2D] transition-colors">
                  <Globe className="w-5 h-5 text-[#FF4D2D]" />
                  <span>newspercent.com</span>
                </a>
                <a href="mailto:adminnewspercent@gmail.com" className="flex items-center gap-3.5 text-sm font-bold uppercase tracking-widest text-[#111111] hover:text-[#FF4D2D] transition-colors">
                  <Mail className="w-5 h-5 text-[#FF4D2D]" />
                  <span>adminnewspercent@gmail.com</span>
                </a>
                <a href="https://wa.me/918179323368" className="flex items-center gap-3.5 text-sm font-bold uppercase tracking-widest text-[#111111] hover:text-[#FF4D2D] transition-colors">
                  <Phone className="w-5 h-5 text-[#FF4D2D]" />
                  <span>+91 8179323368</span>
                </a>
              </div>
            </div>

            {/* Social Grid */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest">Follow Our Channels</span>
              <h3 className="text-2xl font-extrabold uppercase text-[#111111]">Follow NewsPercent</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { name: 'Instagram', icon: FaInstagram, url: SOCIAL_LINKS.instagram, color: 'hover:text-[#E1306C] hover:border-[#E1306C]/40 hover:bg-[#E1306C]/5' },
                  { name: 'YouTube', icon: FaYoutube, url: SOCIAL_LINKS.youtube, color: 'hover:text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5' },
                  { name: 'X', icon: FaXTwitter, url: SOCIAL_LINKS.twitter, color: 'hover:text-[#111111] hover:border-[#111111]/40 hover:bg-[#111111]/5' },
                  { name: 'Facebook', icon: FaFacebook, url: SOCIAL_LINKS.facebook, color: 'hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5' },
                  { name: 'LinkedIn', icon: FaLinkedin, url: SOCIAL_LINKS.linkedin, color: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5' },
                  { name: 'Reddit', icon: FaReddit, url: SOCIAL_LINKS.reddit, color: 'hover:text-[#FF4500] hover:border-[#FF4500]/40 hover:bg-[#FF4500]/5' },
                  { name: 'Discord', icon: FaDiscord, url: SOCIAL_LINKS.discord, color: 'hover:text-[#5865F2] hover:border-[#5865F2]/40 hover:bg-[#5865F2]/5' },
                  { name: 'Quora', icon: FaQuora, url: SOCIAL_LINKS.quora, color: 'hover:text-[#B92B27] hover:border-[#B92B27]/40 hover:bg-[#B92B27]/5' },
                  { name: 'Telegram', icon: FaTelegram, url: SOCIAL_LINKS.telegram, color: 'hover:text-[#24A1DE] hover:border-[#24A1DE]/40 hover:bg-[#24A1DE]/5' },
                  { name: 'WhatsApp', icon: FaWhatsapp, url: SOCIAL_LINKS.whatsapp, color: 'hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/5' }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-4 border border-[#E5E7EB] bg-[#F9FAFB] rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group ${social.color}`}
                  >
                    <social.icon className="w-5 h-5 text-[#555555] group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-[9px] font-black uppercase text-[#555555] group-hover:text-inherit mt-2.5 tracking-wider">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* STORY TIPS & FINAL */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#FF4D2D]" />
              <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111]">Have A Story To Share?</h3>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF4D2D]">Your voice matters. Reach out to the team if you have:</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                'News tips', 'Story ideas', 'Community issues', 
                'Startup journeys', 'Event updates', 'Public-interest concerns'
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#555555]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D2D]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-center lg:text-left p-8">
            <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111]">Final Statement</h3>
            <p className="text-base text-[#555555] leading-relaxed">
              We are not just building a news website. We are building a platform where journalism meets technology, where young voices matter, and where meaningful conversations take priority over noise.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-3 select-none">
                <img src="/logo.webp" alt="N%" className="h-8 w-auto" />
                <div className="flex flex-col leading-none text-left">
                  <span className="font-extrabold text-lg tracking-widest uppercase">N%</span>
                  <span className="text-[8px] font-bold text-[#FF4D2D] uppercase tracking-widest mt-0.5">Youth-Led Digital News Network</span>
                </div>
              </div>
              <span className="text-[#E5E7EB] hidden sm:inline">|</span>
              <span className="text-xs text-[#555555] font-black uppercase tracking-widest">
                A movement against noisy media
              </span>
            </div>
          </div>
        </motion.section>
      </motion.main>

      <Footer />
    </div>
  );
};

export default About;
