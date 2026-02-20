declare module '@/layout/composables/layout' {
  import type { Ref, ComputedRef } from 'vue'

  export type MenuMode = 'static' | 'overlay' | 'horizontal' | 'slim' | string
  export type InputStyle = 'outlined' | 'filled' | string

  export interface LayoutConfig {
    ripple: Ref<boolean>
    darkTheme: Ref<boolean>
    inputStyle: Ref<InputStyle>
    menuMode: Ref<MenuMode>
    theme: Ref<string>
    scale: Ref<number>
    activeMenuItem: Ref<any>
  }

  export interface LayoutState {
    staticMenuDesktopInactive: Ref<boolean>
    overlayMenuActive: Ref<boolean>
    profileSidebarVisible: Ref<boolean>
    configSidebarVisible: Ref<boolean>
    staticMenuMobileActive: Ref<boolean>
    menuHoverActive: Ref<boolean>
  }

  export function useLayout(): {
    layoutConfig: LayoutConfig
    layoutState: LayoutState
    changeThemeSettings: (theme: string, darkTheme: boolean) => void
    setScale: (scale: number) => void
    setActiveMenuItem: (item: any) => void
    onMenuToggle: () => void
    isSidebarActive: ComputedRef<boolean>
    isDarkTheme: ComputedRef<boolean>
  }
}
