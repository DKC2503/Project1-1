import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { FaInstagram, FaYoutube, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/news_percent?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  youtube: "https://youtube.com/@newspercent?si=MSijbFoZuTzZ_UfA",
  twitter: "https://x.com/NewspercentNews?s=20",
  whatsapp: "https://whatsapp.com/channel/0029VayEkt9BKfhrtE3ncR2H",
  telegram: "https://t.me/newspercent",
};

const FOOTER_CONFIG = {
  address: "Visakhapatnam, Andhra Pradesh, India",
  email: "adminnewspercent@gmail.com",
  phone: "+91 8179323368"
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--background-deep)] pt-12 pb-8 border-t border-[var(--glass-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
          {/* Column 1: Branding & Social (Span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4 group">
              <img 
                src="/logo.webp" 
                alt="N% Logo" 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col leading-none">
                <div className="font-bold text-2xl tracking-tighter font-lemon-milk">
                  <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span>
                  <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
                </div>
                <span className="text-[9px] text-primary font-bold tracking-[0.2em] uppercase mt-1">
                  South India's First Youth-Led Digital News Network
                </span>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 max-w-md">
              Experience journalism in its most refined form. <span className="font-bold text-[var(--text-primary)]">NEWS</span><span className="font-bold text-[#FFD84D]">PERCENT</span> delivers real-time insights, 
              global perspectives, and future-forward reporting.
            </p>
            <div className="flex gap-3">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="p-2.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl hover:bg-[#E1306C]/10 hover:border-[#E1306C]/40 transition-all group" title="Instagram">
                <FaInstagram className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#E1306C] transition-transform group-hover:scale-105" />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="p-2.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl hover:bg-[#FF0000]/10 hover:border-[#FF0000]/40 transition-all group" title="YouTube">
                <FaYoutube className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#FF0000] transition-transform group-hover:scale-105" />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="p-2.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/40 transition-all group" title="X">
                <FaXTwitter className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#1DA1F2] transition-transform group-hover:scale-105" />
              </a>
              <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="p-2.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl hover:bg-[#25D366]/10 hover:border-[#25D366]/40 transition-all group" title="WhatsApp">
                <FaWhatsapp className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#25D366] transition-transform group-hover:scale-105" />
              </a>
              <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="p-2.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl hover:bg-[#229ED9]/10 hover:border-[#229ED9]/40 transition-all group" title="Telegram">
                <FaTelegram className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#229ED9] transition-transform group-hover:scale-105" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (Span 4) */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <h4 className="text-[var(--text-primary)] font-bold mb-4 text-xs uppercase tracking-widest">Quick Links</h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Contact', href: '/contact' },
                { name: 'Careers', href: '/careers' },
                { name: 'Advertise', href: '/advertise' },
                { name: 'Privacy Policy', href: '/privacy' }
              ].map((link, idx, arr) => (
                <React.Fragment key={link.name}>
                  <Link to={link.href} className="text-[var(--text-secondary)] text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
                    {link.name}
                  </Link>
                  {idx < arr.length - 1 && <span className="text-[var(--glass-border)] hidden sm:inline">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Column 3: Contact Information (Span 3) */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <h4 className="text-[var(--text-primary)] font-bold mb-4 text-xs uppercase tracking-widest">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[var(--text-secondary)] text-sm">{FOOTER_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${FOOTER_CONFIG.email}`} className="text-[var(--text-secondary)] text-sm hover:text-primary transition-colors">{FOOTER_CONFIG.email}</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="https://wa.me/918179323368" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] text-sm hover:text-primary transition-colors">{FOOTER_CONFIG.phone}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--glass-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-secondary)] text-[10px] font-bold tracking-widest uppercase">
            © {currentYear} <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span><span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-[10px] font-bold tracking-widest text-[var(--text-secondary)]">
            <Link to="/terms" className="hover:text-primary transition-colors">TERMS</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">PRIVACY</Link>
            <Link to="/editorial" className="hover:text-primary transition-colors">EDITORIAL</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
