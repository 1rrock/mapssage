import { create } from 'zustand';

interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  level: number;
  centerVersion: number;
  setCenter: (lat: number, lng: number) => void;
  setLevel: (level: number) => void;
  forceCenter: (lat: number, lng: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: {
    lat: 37.5665,
    lng: 126.9780,
  },
  level: 3,
  centerVersion: 0,
  setCenter: (lat, lng) => set({ center: { lat, lng } }),
  setLevel: (level) => set({ level }),
  forceCenter: (lat, lng) => set((state) => ({ 
    center: { lat, lng },
    centerVersion: state.centerVersion + 1,
  })),
}));
