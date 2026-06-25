import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { useToastStore } from '../hooks/useToastStore';
import { 
  Mail, 
  Phone, 
  Globe, 
  Send, 
  MessageSquare,
  Clock
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

const Contact: React.FC = () => {
  const { addToast } = useToastStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      addToast('error', 'VALIDATION ERROR', 'All form fields are required.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      addToast('error', 'INVALID EMAIL', 'Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      addToast('success', 'MESSAGE TRANSMITTED', 'Your query has been logged. Desk editors will reply shortly.');
      setFormData({
        fullName: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

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
        className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-16"
      >
        {/* HERO TITLE */}
        <motion.section variants={itemVariants} className="text-center space-y-4 max-w-3xl mx-auto mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4D2D]/10 border border-[#FF4D2D]/20 text-xs font-black tracking-widest uppercase text-[#FF4D2D]">
            Get In Touch
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111111] leading-none font-lemon">
            Contact & Connect With Us
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#FF4D2D]">
            A Movement Against Noisy Media
          </p>
          <p className="text-[#555555] text-base leading-relaxed pt-2 max-w-2xl mx-auto">
            We value meaningful conversations, collaboration opportunities, story ideas, partnerships, and community engagement. Use the secure channel below to reach the NewsPercent team.
          </p>
        </motion.section>

        {/* MAIN LAYOUT */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN: CONTACT DETAILS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Contact Details Card */}
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5D76E]/10 rounded-full blur-3xl group-hover:bg-[#F5D76E]/20 transition-colors" />
              
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest">HQ Channels</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-[#111111]">Official Contacts</h2>
              </div>

              <div className="space-y-6 pt-4 border-t border-[#E5E7EB]">
                {/* Email */}
                <a 
                  href="mailto:adminnewspercent@gmail.com" 
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#FF4D2D]/30 hover:bg-[#FF4D2D]/5 transition-all group/item"
                >
                  <div className="p-3 bg-[#FF4D2D]/10 rounded-xl text-[#FF4D2D] shrink-0 group-hover/item:bg-[#FF4D2D] group-hover/item:text-white transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-[#555555] tracking-widest">Email Address</span>
                    <p className="text-sm font-extrabold text-[#111111] lowercase truncate">
                      adminnewspercent@gmail.com
                    </p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a 
                  href="https://wa.me/918179323368" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#25D366]/30 hover:bg-[#25D366]/5 transition-all group/item"
                >
                  <div className="p-3 bg-[#25D366]/10 rounded-xl text-[#25D366] shrink-0 group-hover/item:bg-[#25D366] group-hover/item:text-white transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-[#555555] tracking-widest">Phone & WhatsApp</span>
                    <p className="text-sm font-extrabold text-[#111111]">
                      +91 8179323368
                    </p>
                  </div>
                </a>

                {/* Website */}
                <a 
                  href="https://newspercent.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#F5D76E]/40 hover:bg-[#F5D76E]/5 transition-all group/item"
                >
                  <div className="p-3 bg-[#F5D76E]/20 rounded-xl text-[#9B7C1C] shrink-0 group-hover/item:bg-[#F5D76E] group-hover/item:text-white transition-all">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-[#555555] tracking-widest">Official Website</span>
                    <p className="text-sm font-extrabold text-[#111111]">
                      newspercent.com
                    </p>
                  </div>
                </a>
              </div>

              {/* Extra Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB] text-[#555555] text-xs">
                <Clock className="w-4 h-4 text-[#FF4D2D] shrink-0" />
                <span className="font-bold uppercase tracking-wider">Editors reply within 6 hours</span>
              </div>
            </div>

            {/* Social Links Row */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-6">
              <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest block">Social Media Links</span>
              <div className="flex flex-wrap gap-2.5">
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
                    title={social.name}
                    className={`p-3 border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group ${social.color}`}
                  >
                    <social.icon className="w-4 h-4 text-[#555555] group-hover:scale-110 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest">Secure Terminal</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-[#111111]">Contact Form</h2>
              <p className="text-xs text-[#555555] leading-relaxed">
                Fill out the transmission form below to directly alert the NewsPercent operations desk.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-[#E5E7EB]">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-[10px] font-black uppercase text-[#111111] tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="e.g., Karthik Kumar"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-5 py-4 text-sm font-medium text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D2D]/10 focus:border-[#FF4D2D]/40 transition-all"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black uppercase text-[#111111] tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g., email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-5 py-4 text-sm font-medium text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D2D]/10 focus:border-[#FF4D2D]/40 transition-all"
                  required
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-[10px] font-black uppercase text-[#111111] tracking-widest">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="e.g., Collaboration Proposal / Story Tip"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-5 py-4 text-sm font-medium text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D2D]/10 focus:border-[#FF4D2D]/40 transition-all"
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] font-black uppercase text-[#111111] tracking-widest">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Write details of your message..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-5 py-4 text-sm font-medium text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D2D]/10 focus:border-[#FF4D2D]/40 transition-all resize-none"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#FF4D2D] hover:bg-[#E03A1C] text-white font-bold rounded-2xl shadow-lg shadow-[#FF4D2D]/15 active:scale-98 transition-all disabled:opacity-50 text-xs font-black uppercase tracking-widest"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.section>

        {/* HAVE A STORY TO SHARE BANNER */}
        <motion.section variants={itemVariants} className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#FF4D2D]" />
            <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111]">Have A Story To Share?</h3>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#FF4D2D]">Your voice matters. Reach out to the team if you have:</p>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 pt-2">
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
        </motion.section>
      </motion.main>

      <Footer />
    </div>
  );
};

export default Contact;
