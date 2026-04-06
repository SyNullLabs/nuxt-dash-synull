export default defineAppConfig({
  ui: {
    colors: {
      primary: "purple",
      neutral: "neutral",
    },
    skeleton: {
      base: "animate-pulse rounded-md bg-accented",
    },
    sidebar: {
      slots: {
        gap: 'relative w-(--sidebar-width) bg-transparent transition-[width] duration-300 ease-in-out',
        container: 'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-300 ease-in-out lg:flex',
        rail: 'absolute inset-y-0 z-20 hidden w-4 transition-all ease-in-out after:absolute after:inset-y-0 after:left-1/2 after:w-px lg:flex hover:after:bg-(--ui-border-accented) after:transition-colors'
      }
    }
  },
});
