import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Mail, AlertCircle, CheckCircle2, Loader2, ShieldCheck, ChevronLeft, RefreshCw, User } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { cn } from '../lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginStep = 'email' | 'otp';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleBack = () => {
    if (step === 'otp') setStep('email');
    setStatus('idle');
    setMessage('');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    try {
      setStatus('loading');
      setMessage('');
      const res = await api.post('/api/auth/send-otp', { email });
      if (res.data.success) {
        setProfileImage(res.data.profileImage || null);
        setStep('otp');
        setStatus('idle');
        setCountdown(60);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Intelligence link failed.');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || status === 'loading') return;

    try {
      setStatus('loading');
      setMessage('');
      const res = await api.post('/api/auth/verify-otp', { email, otp });
      
      const { user, token, loginLogId } = res.data;

      setStatus('success');
      setMessage('Identity verified. Loading Dashboard...');
      
      setAuth(user, token, loginLogId);

      setTimeout(() => {
        onClose();
        if (['super_admin', 'admin', 'editor', 'reviewer'].includes(user.role)) {
          navigate('/admin');
        } else if (user.role === 'author') {
          navigate('/author');
        } else {
           navigate('/');
        }
        
        // Reset state after closing
        setTimeout(() => {
          setStep('email');
          setEmail('');
          setOtp('');
          setStatus('idle');
          setMessage('');
        }, 500);
      }, 1500);

    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'OTP verification failed.');
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    try {
      setStatus('loading');
      await api.post('/api/auth/send-otp', { email });
      setStatus('idle');
      setCountdown(60);
      setMessage('New access code transmitted.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Resend failed.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 light:bg-[#111111]/80 backdrop-blur-3xl light:backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-[480px] liquid-glass p-10 rounded-[2.5rem] border-primary/20 shadow-2xl overflow-hidden flex flex-col items-center transition-colors duration-300",
              "light:bg-white light:border-[#E8E2D8] light:shadow-2xl"
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,69,58,0.05),transparent_70%)] pointer-events-none light:hidden" />
            
            {step === 'otp' && (
              <button 
                onClick={handleBack} 
                className="absolute top-6 left-6 text-slate-800 dark:text-white hover:text-primary transition-colors p-2 bg-slate-100 dark:bg-white/10 rounded-full z-20 border border-slate-200 dark:border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 text-slate-800 dark:text-white hover:text-primary transition-colors p-2 bg-slate-100 dark:bg-white/10 rounded-full z-20 border border-slate-200 dark:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <img src="/logo.webp" alt="N%" className="h-14 w-auto mb-4 drop-shadow-[0_0_20px_rgba(255,59,48,0.4)] light:drop-shadow-none" />
              <div className="text-2xl font-extrabold tracking-tight font-lemon-milk uppercase">
                <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span>
                <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
              </div>
              <p className="text-[10px] text-primary font-bold tracking-widest uppercase mt-2 opacity-80 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure Access Portal
              </p>
            </div>

            <div className="w-full relative z-10 min-h-[280px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {step === 'email' && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 light:bg-[#F9F8F6] border border-white/10 light:border-[#E8E2D8] flex items-center justify-center mb-6">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase mb-2">Identify Node</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-8 font-bold">Enter your registered email address</p>
                    
                    <form onSubmit={handleSendOTP} className="w-full space-y-4">
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email ID"
                        className="w-full bg-white/5 light:bg-[#F9F8F6] border border-white/10 light:border-[#E8E2D8] rounded-2xl py-4 px-6 text-center text-[var(--text-primary)] focus:outline-none focus:border-primary transition-all font-manrope font-bold"
                      />
                      <button 
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 light:shadow-primary/10 transition-all uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
                      >
                        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Request Access <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center"
                  >
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover mb-6 border-2 border-primary/20 shadow-[0_0_15px_rgba(255,69,58,0.2)]" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/5 light:bg-[#F9F8F6] border border-white/10 light:border-[#E8E2D8] flex items-center justify-center mb-6">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase mb-2">Verification Required</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-8 text-center px-4 font-bold">
                      Transmitted to <span className="text-[var(--text-primary)]">{email}</span>
                    </p>
                    
                    <form onSubmit={handleVerifyOTP} className="w-full space-y-6">
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000 000"
                        className="w-full bg-white/5 light:bg-[#F9F8F6] border border-white/10 light:border-[#E8E2D8] rounded-2xl py-4 px-6 text-center text-2xl font-black text-[var(--text-primary)] tracking-[0.5em] focus:outline-none focus:border-primary transition-all font-manrope"
                      />
                      
                      <div className="flex flex-col gap-4">
                        <button 
                          type="submit"
                          disabled={status === 'loading' || otp.length !== 6}
                          className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 light:shadow-primary/10 transition-all uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Authenticate Identity</>}
                        </button>

                        <button 
                          type="button"
                          onClick={resendOTP}
                          disabled={countdown > 0 || status === 'loading'}
                          className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest hover:text-primary transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                          {countdown > 0 ? `Resend available in ${countdown}s` : <><RefreshCw className="w-3 h-3" /> Resend Access Code</>}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-6 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider border",
                    status === 'error' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-success/10 border-success/20 text-success"
                  )}
                >
                  {status === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                  {message}
                </motion.div>
              )}
            </div>

            <p className="text-[9px] text-[var(--text-secondary)] text-center mt-10 uppercase tracking-widest font-bold opacity-30 leading-relaxed max-w-[280px]">
              NewsPercent Publisher Portal <br /> 
              Authorized Creator Access Only
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
