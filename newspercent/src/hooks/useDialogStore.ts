import { create } from 'zustand';
import { npAlert, confirmDelete, npPrompt, npConfirm } from '../utils/swal';

type DialogType = 'alert' | 'confirm' | 'prompt' | 'revision';

interface DialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  options: DialogOptions;
  resolve: ((value: any) => void) | null;
  
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
  confirmDelete: (message: string, title?: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
  prompt: (message: string, title?: string, defaultValue?: string) => Promise<string | null>;
  revision: () => Promise<{ notes: string; priority: string } | null>;
  
  close: (value?: any) => void;
}

// NOTE: We keep the store for state-dependent custom modals like 'revision', 
// but redirect standard alerts/confirms/prompts to SweetAlert2 for the required UI.

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  type: 'alert',
  options: {},
  resolve: null,

  alert: async (message, title = 'System Notification') => {
    await npAlert(title, message);
  },

  confirm: async (message, title = 'Confirm Action', confirmText = 'CONFIRM', cancelText = 'CANCEL') => {
    const result = await npConfirm(title, message, confirmText, cancelText);
    return result.isConfirmed;
  },

  confirmDelete: async (message, title = 'Delete Confirmation', confirmText = 'DELETE ARTICLE', cancelText = 'CANCEL') => {
    const result = await confirmDelete(title, message, confirmText, cancelText);
    return result.isConfirmed;
  },

  prompt: async (message, title = 'Input Required', defaultValue = '') => {
    const result = await npPrompt(title, message, 'Enter value...', defaultValue);
    return result.isConfirmed ? result.value : null;
  },

  revision: () => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type: 'revision',
        options: { 
          title: 'Revision Directives', 
          message: 'Provide intelligence feedback for the author.' 
        },
        resolve: (value: { notes: string; priority: string } | null) => {
          set({ isOpen: false });
          resolve(value);
        }
      });
    });
  },

  close: (value) => {
    const { resolve } = get();
    if (resolve) resolve(value);
  }
}));
