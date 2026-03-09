export const DESKTOP_LAYOUT_BREAKPOINT = 1024

export const DESKTOP_LAYOUT_VIEWPORTS = {
    mobile: 390,
    desktop: 1280,
}

export const DESKTOP_LAYOUT_SCOPED_PAGES = {
    home: {
        route: '/home',
        maxWidth: 1180,
        horizontalPadding: 24,
        verticalPadding: 16,
    },
    schedule: {
        route: '/schedule',
        maxWidth: 1120,
        horizontalPadding: 24,
        verticalPadding: 16,
    },
    setting: {
        route: '/setting',
        maxWidth: 1024,
        horizontalPadding: 24,
        verticalPadding: 16,
    },
}

export function getDesktopLayoutPage(pageKey) {
    if (!pageKey) return null
    return DESKTOP_LAYOUT_SCOPED_PAGES[pageKey] || null
}

