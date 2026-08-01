import React from 'react';
import { FaInstagram, FaYoutube, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/news_percent?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  youtube: "https://youtube.com/@newspercent?si=MSijbFoZuTzZ_UfA",
  twitter: "https://x.com/NewspercentNews?s=20",
  whatsapp: "https://whatsapp.com/channel/0029VayEkt9BKfhrtE3ncR2H",
  telegram: "https://t.me/newspercent",
};

const FollowUsBar: React.FC = () => {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-8 mb-16">
      <div className="liquid-glass p-6 rounded-3xl flex flex-col md:flex-row items-center justify-center gap-6 border-[var(--glass-border)]">
        <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap font-lemon-milk">
          <span className="text-[var(--text-primary)] font-lemon-milk">Follow NEWS</span>
          <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--glass-border)] hover:border-[#E1306C]/40 hover:bg-[#E1306C]/5 transition-all group">
            <FaInstagram className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#E1306C]" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[#E1306C] uppercase tracking-widest">Instagram</span>
          </a>
          <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--glass-border)] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5 transition-all group">
            <FaYoutube className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#FF0000]" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[#FF0000] uppercase tracking-widest">YouTube</span>
          </a>
          <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--glass-border)] hover:border-[#1DA1F2]/40 hover:bg-[#1DA1F2]/5 transition-all group">
            <FaXTwitter className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#1DA1F2]" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[#1DA1F2] uppercase tracking-widest">X</span>
          </a>
          <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--glass-border)] hover:border-[#25D366]/40 hover:bg-[#25D366]/5 transition-all group">
            <FaWhatsapp className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#25D366]" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[#25D366] uppercase tracking-widest">WhatsApp</span>
          </a>
          <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--glass-border)] hover:border-[#229ED9]/40 hover:bg-[#229ED9]/5 transition-all group">
            <FaTelegram className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[#229ED9]" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[#229ED9] uppercase tracking-widest">Telegram</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FollowUsBar;
