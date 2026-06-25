import React from 'react';
import { FaInstagram, FaYoutube, FaWhatsapp, FaTelegram, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { cn } from '../lib/utils';

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/news_percent?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  youtube: "https://youtube.com/@newspercent?si=MSijbFoZuTzZ_UfA",
  twitter: "https://x.com/NewspercentNews?s=20",
  whatsapp: "https://whatsapp.com/channel/0029VayEkt9BKfhrtE3ncR2H",
  telegram: "https://t.me/newspercent",
  facebook: "https://facebook.com/newspercent"
};

const SocialSidebar: React.FC = () => {
  const links = [
    { name: 'Instagram', icon: FaInstagram, url: SOCIAL_LINKS.instagram, color: 'hover:text-[#E1306C] hover:border-[#E1306C]/40' },
    { name: 'YouTube', icon: FaYoutube, url: SOCIAL_LINKS.youtube, color: 'hover:text-[#FF0000] hover:border-[#FF0000]/40' },
    { name: 'X', icon: FaXTwitter, url: SOCIAL_LINKS.twitter, color: 'hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/40' },
    { name: 'WhatsApp', icon: FaWhatsapp, url: SOCIAL_LINKS.whatsapp, color: 'hover:text-[#25D366] hover:border-[#25D366]/40' },
    { name: 'Telegram', icon: FaTelegram, url: SOCIAL_LINKS.telegram, color: 'hover:text-[#0088cc] hover:border-[#0088cc]/40' },
    { name: 'Facebook', icon: FaFacebook, url: SOCIAL_LINKS.facebook, color: 'hover:text-[#1877F2] hover:border-[#1877F2]/40' }
  ];

  return (
    <div className={cn(
      "flex border border-[var(--glass-border)] bg-[var(--surface-hover)]/30 backdrop-blur-md select-none transition-all duration-300",
      // Desktop: Left vertical sidebar
      "lg:flex-col lg:w-16 lg:h-[500px] lg:justify-center lg:items-center lg:gap-8 lg:rounded-[2.5rem] lg:py-8 lg:px-4",
      // Mobile: Top horizontal bar
      "flex-row w-full justify-around items-center gap-4 rounded-[1.5rem] py-4 px-6 mb-2 lg:mb-0"
    )}>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          className={cn(
            "p-3 rounded-xl border border-transparent bg-white/2 hover:bg-white/5",
            "transition-all duration-300 hover:scale-110 active:scale-95 group",
            link.color
          )}
        >
          <link.icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:scale-105 transition-transform" />
        </a>
      ))}
    </div>
  );
};

export default SocialSidebar;
