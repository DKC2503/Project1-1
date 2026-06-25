import { create } from 'zustand';
import api from '../config/api';

interface SystemSettingsState {
  settings: {
    creditSystemEnabled: boolean;
    externalApisEnabled: boolean;
    emergencyMode: boolean;
    exportSystemEnabled: boolean;
    performanceCreditsEnabled: boolean;
    documentExportEnabled: boolean;
    weatherApiEnabled: boolean;
    marketApiEnabled: boolean;
    populationApiEnabled: boolean;
    emailServiceEnabled: boolean;
  } | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSystemSettingsStore = create<SystemSettingsState>((set) => ({
  settings: null,
  loading: true,
  fetchSettings: async () => {
    try {
      const res = await api.get('/api/settings/public');
      set({ settings: res.data, loading: false });
    } catch (err) {
      console.error('Failed to load system settings', err);
      set({ loading: false });
    }
  }
}));
