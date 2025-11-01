import { create } from 'zustand';

interface NetworkStatusState {
  isOnline: boolean;
  lastChangedAt: number | null;
  setOnline: (status: boolean) => void;
}

export const useNetworkStatusStore = create<NetworkStatusState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastChangedAt: null,
  setOnline: (status) => set({ isOnline: status, lastChangedAt: Date.now() })
}));

export const selectIsOnline = (state: NetworkStatusState) => state.isOnline;
export const selectLastChangedAt = (state: NetworkStatusState) => state.lastChangedAt;
