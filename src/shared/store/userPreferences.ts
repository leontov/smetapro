import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemePreference = 'system' | 'light' | 'dark';

interface UserPreferencesState {
  theme: ThemePreference;
  language: string;
  enableNotifications: boolean;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: string) => void;
  toggleNotifications: (value?: boolean) => void;
}

const storageKey = 'smetapro:user-preferences';

const createPreferencesStore: StateCreator<UserPreferencesState> = (set) => ({
  theme: 'system',
  language: 'ru-RU',
  enableNotifications: false,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  toggleNotifications: (value) =>
    set((state) => ({
      enableNotifications: typeof value === 'boolean' ? value : !state.enableNotifications
    }))
});

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist<UserPreferencesState>(createPreferencesStore, {
    name: storageKey
  })
);

export const selectTheme = (state: UserPreferencesState) => state.theme;
export const selectLanguage = (state: UserPreferencesState) => state.language;
export const selectNotifications = (state: UserPreferencesState) => state.enableNotifications;
