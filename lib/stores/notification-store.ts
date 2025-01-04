import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  createdAt: Date
}

interface NotificationStore {
  notifications: Notification[]
  toasts: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  removeToast: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  toasts: [],
  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
    }
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      toasts: [newNotification, ...state.toasts],
    }))
    // Trigger haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50) // Vibrate for 50ms
    }
    // Remove toast after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== newNotification.id),
      }))
    }, 5000)
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearNotifications: () => set({ notifications: [], toasts: [] }),
}))
