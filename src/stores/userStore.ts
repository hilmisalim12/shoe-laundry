import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Profile } from '@/src/types';

type UserState = {
  profile: Profile | null;
  isHydrated: boolean;
  setProfile: (profile: Profile | null) => void;
  setHydrated: (value: boolean) => void;
  signOut: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      isHydrated: false,
      setProfile: (profile) => set({ profile }),
      setHydrated: (value) => set({ isHydrated: value }),
      signOut: () => set({ profile: null }),
    }),
    {
      name: 'shoe-laundry-user',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
