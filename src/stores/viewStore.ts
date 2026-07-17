"use client";

import { create } from "zustand";
import { ViewType, FilterState } from "@/types";

interface ViewStore {
  currentView: ViewType;
  previousView: ViewType;
  filters: FilterState;
  isSidebarOpen: boolean;
  isTaskModalOpen: boolean;
  editingTaskId: string | null;
  selectedDate: string | null;

  // Navigation
  setView: (view: ViewType) => void;
  goBack: () => void;

  // Filters
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;

  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Task Modal
  openTaskModal: (taskId?: string) => void;
  closeTaskModal: () => void;

  // Calendar
  setSelectedDate: (date: string | null) => void;
}

const defaultFilters: FilterState = {
  search: "",
  status: "all",
  priority: "all",
  energyLevel: "all",
  category: "all",
  tags: [],
  sortBy: "order",
  sortDirection: "asc",
  showCompleted: false,
};

export const useViewStore = create<ViewStore>((set, get) => ({
  currentView: "dashboard",
  previousView: "dashboard",
  filters: { ...defaultFilters },
  isSidebarOpen: true,
  isTaskModalOpen: false,
  editingTaskId: null,
  selectedDate: null,

  // ============================================
  // NAVIGATION
  // ============================================

  setView: (view) => {
    set((state) => ({
      previousView: state.currentView,
      currentView: view,
    }));
  },

  goBack: () => {
    set((state) => ({
      currentView: state.previousView,
      previousView: "dashboard",
    }));
  },

  // ============================================
  // FILTERS
  // ============================================

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
  },

  setSearchQuery: (query) => {
    set((state) => ({
      filters: { ...state.filters, search: query },
    }));
  },

  // ============================================
  // SIDEBAR
  // ============================================

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ isSidebarOpen: open });
  },

  // ============================================
  // TASK MODAL
  // ============================================

  openTaskModal: (taskId) => {
    set({
      isTaskModalOpen: true,
      editingTaskId: taskId || null,
    });
  },

  closeTaskModal: () => {
    set({
      isTaskModalOpen: false,
      editingTaskId: null,
    });
  },

  // ============================================
  // CALENDAR
  // ============================================

  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
}));
