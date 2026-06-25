import Swal from 'sweetalert2';

export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: 'var(--background-deep)',
  color: 'var(--text-primary)',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const confirmDelete = async (
  title: string, 
  text: string = 'This action cannot be undone.',
  confirmButtonText: string = 'DELETE ARTICLE',
  cancelButtonText: string = 'CANCEL'
) => {
  return Swal.fire({
    title: title.toUpperCase(),
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'var(--primary)',
    cancelButtonColor: 'rgba(255,255,255,0.05)',
    confirmButtonText: confirmButtonText.toUpperCase(),
    cancelButtonText: cancelButtonText.toUpperCase(),
    background: '#0A0A0B',
    color: '#FFFFFF',
    customClass: {
      popup: 'border border-primary/20 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl',
      title: 'font-lemon tracking-tighter text-2xl',
      htmlContainer: 'font-manrope text-[10px] uppercase tracking-widest opacity-60 font-bold',
      confirmButton: 'px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20',
      cancelButton: 'px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10'
    }
  });
};

export const npConfirm = async (
  title: string, 
  text: string, 
  confirmButtonText: string = 'CONFIRM', 
  cancelButtonText: string = 'CANCEL'
) => {
  return Swal.fire({
    title: title.toUpperCase(),
    text: text,
    showCancelButton: true,
    confirmButtonColor: 'var(--primary)',
    cancelButtonColor: 'rgba(255,255,255,0.05)',
    confirmButtonText: confirmButtonText.toUpperCase(),
    cancelButtonText: cancelButtonText.toUpperCase(),
    background: '#0A0A0B',
    color: '#FFFFFF',
    customClass: {
      popup: 'border border-primary/20 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl',
      title: 'font-lemon tracking-tighter text-2xl',
      htmlContainer: 'font-manrope text-[10px] uppercase tracking-widest opacity-60 font-bold',
      confirmButton: 'px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20',
      cancelButton: 'px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10'
    }
  });
};

export const npAlert = (title: string, text: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  return Swal.fire({
    title: title.toUpperCase(),
    text: text,
    icon: icon,
    confirmButtonColor: 'var(--primary)',
    background: '#0A0A0B',
    color: '#FFFFFF',
    customClass: {
      popup: 'border border-primary/20 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl',
      title: 'font-lemon tracking-tighter text-2xl',
      htmlContainer: 'font-manrope text-[10px] uppercase tracking-widest opacity-60 font-bold',
      confirmButton: 'px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20'
    }
  });
};

export const npPrompt = async (title: string, text: string, placeholder: string = '', defaultValue: string = '') => {
  return Swal.fire({
    title: title.toUpperCase(),
    text: text,
    input: 'text',
    inputPlaceholder: placeholder,
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonColor: 'var(--primary)',
    cancelButtonColor: 'rgba(255,255,255,0.05)',
    confirmButtonText: 'SUBMIT',
    cancelButtonText: 'CANCEL',
    background: '#0A0A0B',
    color: '#FFFFFF',
    customClass: {
      popup: 'border border-primary/20 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl',
      title: 'font-lemon tracking-tighter text-2xl',
      htmlContainer: 'font-manrope text-[10px] uppercase tracking-widest opacity-60 font-bold',
      input: 'bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-primary transition-all font-manrope',
      confirmButton: 'px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20',
      cancelButton: 'px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10'
    }
  });
};
