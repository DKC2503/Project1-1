import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { 
  Briefcase, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import api from '../config/api';

interface RecruitmentData {
  title: string;
  description: string;
  googleFormLink: string;
  buttonText: string;
  status: 'OPEN' | 'CLOSED';
  published: 'Published' | 'Draft';
}

const Careers: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [recruitment, setRecruitment] = useState<RecruitmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRecruitment = async () => {
      try {
        setLoading(true);
        setError(false);
        const endpoint = isPreview ? '/api/recruitment' : '/api/public/recruitment';
        const res = await api.get(endpoint);
        if (res.data && res.data.data) {
          setRecruitment(res.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load recruitment data', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruitment();
  }, [isPreview]);

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

  const isClosed = !recruitment || recruitment.status === 'CLOSED';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-manrope selection:bg-[#F5D76E]/40 flex flex-col justify-between">
      <div>
        <SiteHeader />

        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="pt-32 pb-24 max-w-4xl mx-auto px-6 text-center space-y-16"
        >
          {/* Header Tag / Preview Indicator */}
          <motion.div variants={itemVariants} className="flex justify-center">
            {isPreview ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-black tracking-widest uppercase text-amber-500 animate-pulse">
                Admin Preview Mode
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4D2D]/10 border border-[#FF4D2D]/20 text-xs font-black tracking-widest uppercase text-[#FF4D2D]">
                Join Our Team
              </div>
            )}
          </motion.div>

          {loading ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555555]">Loading Opportunities...</p>
            </motion.div>
          ) : error ? (
            <motion.div variants={itemVariants} className="py-20 max-w-md mx-auto space-y-4">
              <AlertCircle className="w-12 h-12 text-[#FF4D2D] mx-auto" />
              <h2 className="text-xl font-extrabold uppercase text-[#111111]">Connection Failed</h2>
              <p className="text-xs text-[#555555]">
                Could not establish connectivity with the recruitment registry. Please check back shortly.
              </p>
            </motion.div>
          ) : isClosed ? (
            /* CLOSED RECRUITMENT VIEW */
            <motion.section 
              variants={itemVariants} 
              className="bg-white border border-[#E5E7EB] p-10 sm:p-16 rounded-[3rem] shadow-[0_15px_40px_rgba(0,0,0,0.02)] max-w-2xl mx-auto space-y-6"
            >
              <Briefcase className="w-10 h-10 text-[#555555] mx-auto opacity-40" />
              <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111] leading-tight font-lemon">
                Recruitment Closed
              </h2>
              <p className="text-[#555555] text-sm leading-relaxed max-w-md mx-auto font-medium">
                Recruitment is currently closed. Please check back later for future opportunities.
              </p>
            </motion.section>
          ) : (
            /* OPEN RECRUITMENT VIEW */
            <motion.section variants={itemVariants} className="space-y-12">
              {/* Category Subtitle */}
              <p className="text-sm font-black uppercase tracking-widest text-[#FF4D2D]">
                Careers
              </p>

              {/* Recruitment Title */}
              <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111111] leading-tight font-lemon max-w-3xl mx-auto">
                {recruitment.title}
              </h1>

              {/* Short Description */}
              <div 
                className="text-[#555555] text-sm leading-relaxed max-w-2xl mx-auto font-medium prose prose-red text-left border border-[#E5E7EB] bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-[0_10px_35px_rgba(0,0,0,0.01)]"
                dangerouslySetInnerHTML={{ __html: recruitment.description }}
              />

              {/* Liquid Glass Apply Now Button */}
              <div className="pt-6 flex justify-center">
                <a
                  href={recruitment.googleFormLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3.5 px-12 py-5 rounded-full border border-[#E5E7EB] hover:border-amber-500/40 bg-white/40 hover:bg-amber-500/5 text-[#111111] hover:text-amber-600 text-xs font-black uppercase tracking-[0.2em] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_35px_rgba(245,215,110,0.2)] hover:scale-105 active:scale-98 transition-all duration-300 relative overflow-hidden group backdrop-blur-lg"
                >
                  {/* Premium reflection shimmer effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {recruitment.buttonText}
                  <ExternalLink className="w-4 h-4 text-amber-500 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </motion.section>
          )}
        </motion.main>
      </div>

      <Footer />
    </div>
  );
};

export default Careers;
