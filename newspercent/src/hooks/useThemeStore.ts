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

  return {
    theme: savedTheme,
    isLoading: false,
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    }),
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      set({ theme });
    },
    setIsLoading: (loading) => set({ isLoading: loading }),
  };
});
