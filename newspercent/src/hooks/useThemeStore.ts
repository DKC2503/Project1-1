import { create } from 'zustand';

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Initialize theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
  
  // Apply initial theme to document
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('light', savedTheme === 'light');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }

  return {
    theme: savedTheme,
    isLoading: false,
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('light', newTheme === 'light');
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    }),
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('light', theme === 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
      set({ theme });
    },
    setIsLoading: (loading) => set({ isLoading: loading }),
  };
});
