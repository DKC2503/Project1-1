import React from 'react';
import { motion } from 'framer-motion';

const TOPICS = [
  'India',
  'AI',
  'Technology',
  'Startups',
  'Sports',
  'Automobile',
  'Global Affairs',
  'Economy'
];

const TrendingTopics: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-8 mb-20">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mr-4 font-manrope">
          Trending Topics:
        </span>
        {TOPICS.map((topic, i) => (
          <motion.button
            key={topic}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ 
              y: -3,
              boxShadow: 'var(--card-shadow)',
              borderColor: 'var(--color-primary)'
            }}
            className="px-6 py-2.5 rounded-full liquid-glass text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] border border-[var(--glass-border)] transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            {topic}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
