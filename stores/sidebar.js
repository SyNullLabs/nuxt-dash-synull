import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isOpen: false,
    isMobile: false,
    currentRoute: '/',
    openSubmenus: [],
  }),
  actions: {
    setIsOpen(value) {
      this.isOpen = value
    },
    setIsMobile(value) {
      this.isMobile = value
      this.isOpen = !value
    },
    setCurrentRoute(route) {
      this.currentRoute = route
    },
    toggleSubmenu(index) {
      const position = this.openSubmenus.indexOf(index)
      if (position > -1) {
        this.openSubmenus.splice(position, 1)
      } else {
        this.openSubmenus.push(index)
      }
    },
  },
})