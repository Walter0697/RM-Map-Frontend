import {
    DESKTOP_LAYOUT_BREAKPOINT,
    DESKTOP_LAYOUT_SCOPED_PAGES,
    DESKTOP_LAYOUT_VIEWPORTS,
    getDesktopLayoutPage,
} from './layoutContract'

describe('layoutContract', () => {
    test('defines supported desktop/mobile breakpoints for scoped pages', () => {
        expect(DESKTOP_LAYOUT_VIEWPORTS.mobile).toBeLessThan(DESKTOP_LAYOUT_BREAKPOINT)
        expect(DESKTOP_LAYOUT_VIEWPORTS.desktop).toBeGreaterThanOrEqual(DESKTOP_LAYOUT_BREAKPOINT)
    })

    test('scoped pages provide route and desktop spacing contract', () => {
        const pageKeys = Object.keys(DESKTOP_LAYOUT_SCOPED_PAGES)
        expect(pageKeys).toEqual(['home', 'schedule', 'setting'])

        pageKeys.forEach((pageKey) => {
            const config = getDesktopLayoutPage(pageKey)
            expect(config).toBeTruthy()
            expect(config.route).toMatch(/^\/[a-z-]+$/)
            expect(config.maxWidth).toBeGreaterThan(900)
            expect(config.horizontalPadding).toBeGreaterThan(0)
            expect(config.verticalPadding).toBeGreaterThan(0)
        })
    })

    test('unknown page keys are rejected from desktop contract lookup', () => {
        expect(getDesktopLayoutPage('search')).toBeNull()
        expect(getDesktopLayoutPage('')).toBeNull()
    })
})

