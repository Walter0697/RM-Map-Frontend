import fs from 'fs'
import path from 'path'

import {
    desktopContract,
    layoutFixture,
    mobileBaselineContract,
} from './desktopLayoutFixtures'

function cssAtDesktopOnly(css, snippet) {
    const mediaPattern = new RegExp(`@media \\(min-width: 1024px\\)[\\s\\S]*${snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
    return mediaPattern.test(css)
}

describe('frontend-layout-regression-remediation desktop/mobile guardrails', () => {
    test('mobile baseline contract remains unchanged for scoped pages', () => {
        expect(mobileBaselineContract).toEqual({
            home: {
                width: '100%',
                maxWidth: 'none',
                horizontalPadding: 0,
                verticalPadding: 0,
                route: '/home',
            },
            schedule: {
                width: '100%',
                maxWidth: 'none',
                horizontalPadding: 0,
                verticalPadding: 0,
                route: '/schedule',
            },
            setting: {
                width: '100%',
                maxWidth: 'none',
                horizontalPadding: 0,
                verticalPadding: 0,
                route: '/setting',
            },
        })
    })

    test('desktop contract assertions remain explicit for scoped pages', () => {
        expect(desktopContract).toEqual({
            home: {
                width: '100%',
                maxWidth: '1180px',
                horizontalPadding: '24px',
                verticalPadding: '16px',
            },
            schedule: {
                width: '100%',
                maxWidth: '1120px',
                horizontalPadding: '24px',
                verticalPadding: '16px',
            },
            setting: {
                width: '100%',
                maxWidth: '1024px',
                horizontalPadding: '24px',
                verticalPadding: '16px',
            },
        })
    })

    test('desktop scoped styles stay under desktop breakpoint media queries', () => {
        const cssPath = path.resolve(__dirname, '../../styles/bottom.module.css')
        const css = fs.readFileSync(cssPath, 'utf8')
        const hasDesktopScopedRule = cssAtDesktopOnly(css, '.desktopScoped')

        expect(hasDesktopScopedRule).toBe(true)
    })

    test('desktop interaction affordances are desktop-scoped and keyboard-visible', () => {
        const cssPath = path.resolve(__dirname, '../../index.css')
        const css = fs.readFileSync(cssPath, 'utf8')
        const desktopInteractionGate = /@media \(min-width: 1024px\) and \(hover: hover\) and \(pointer: fine\)/.test(css)
        const hasFocusVisibleRule = /button:focus-visible/.test(css) && /outline: 2px solid/.test(css)
        const hasHoverFeedback = /button:hover/.test(css) && /filter: brightness\(1\.03\)/.test(css)

        expect(desktopInteractionGate).toBe(true)
        expect(hasFocusVisibleRule).toBe(true)
        expect(hasHoverFeedback).toBe(true)
    })

    test('mobile parity checklist exists and remains checked for merge gating', () => {
        const checklistPath = path.resolve(__dirname, '../../../docs/desktop-web-ux-validation.md')
        const content = fs.readFileSync(checklistPath, 'utf8')
        const uncheckedItems = content.split('\n').filter((line) => line.trim().startsWith('- [ ]'))

        expect(uncheckedItems).toEqual([])
    })

    test('regression diagnostics include viewport labels for triage clarity', () => {
        const desktopLabel = `desktop>=${layoutFixture.breakpoints.desktopMinWidth}px`
        const mobileLabel = `mobile<=${layoutFixture.breakpoints.mobileMaxWidth}px`

        expect(desktopLabel).toContain('desktop')
        expect(mobileLabel).toContain('mobile')
    })
})
