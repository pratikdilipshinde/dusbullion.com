"use client";
import { create } from "zustand";

type UIState = {
  authOpen: boolean;
  initialTab: "login" | "register";
  openAuth: (tab?: "login" | "register") => void;
  closeAuth: () => void;
};

export const useUI = create<UIState>((set) => ({
  authOpen: false,
  initialTab: "login",
  openAuth: (tab = "login") => set({ authOpen: true, initialTab: tab }),
  closeAuth: () => set({ authOpen: false }),
}));
