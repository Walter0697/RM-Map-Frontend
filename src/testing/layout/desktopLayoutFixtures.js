import {
    DESKTOP_LAYOUT_BREAKPOINT,
    DESKTOP_LAYOUT_SCOPED_PAGES,
    DESKTOP_LAYOUT_VIEWPORTS,
} from '../../constant/layoutContract'

export const layoutFixture = {
    breakpoints: {
        mobileMaxWidth: DESKTOP_LAYOUT_BREAKPOINT - 1,
        desktopMinWidth: DESKTOP_LAYOUT_BREAKPOINT,
    },
    viewports: DESKTOP_LAYOUT_VIEWPORTS,
    scopedPages: Object.entries(DESKTOP_LAYOUT_SCOPED_PAGES).map(([key, config]) => ({
        key,
        route: config.route,
        maxWidth: config.maxWidth,
        horizontalPadding: config.horizontalPadding,
        verticalPadding: config.verticalPadding,
    })),
}

export const mobileBaselineContract = layoutFixture.scopedPages.reduce((acc, page) => {
    acc[page.key] = {
        width: '100%',
        maxWidth: 'none',
        horizontalPadding: 0,
        verticalPadding: 0,
        route: page.route,
    }
    return acc
}, {})

export const desktopContract = layoutFixture.scopedPages.reduce((acc, page) => {
    acc[page.key] = {
        width: '100%',
        maxWidth: `${page.maxWidth}px`,
        horizontalPadding: `${page.horizontalPadding}px`,
        verticalPadding: `${page.verticalPadding}px`,
    }
    return acc
}, {})

