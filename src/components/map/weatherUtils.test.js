import { prefersReducedMotion, shouldAnimateWeatherTransition } from './weatherUtils'

describe('weather animation behavior', () => {
    test('triggers animation when viewport moves significantly', () => {
        const before = {
            min_lat: 22.20,
            max_lat: 22.30,
            min_lon: 114.10,
            max_lon: 114.20,
            zoom: 10,
        }
        const after = {
            min_lat: 22.30,
            max_lat: 22.40,
            min_lon: 114.20,
            max_lon: 114.30,
            zoom: 10,
        }
        expect(shouldAnimateWeatherTransition(before, after)).toBe(true)
    })

    test('does not trigger animation when viewport barely changes', () => {
        const before = {
            min_lat: 22.20,
            max_lat: 22.30,
            min_lon: 114.10,
            max_lon: 114.20,
            zoom: 10,
        }
        const after = {
            min_lat: 22.201,
            max_lat: 22.301,
            min_lon: 114.101,
            max_lon: 114.201,
            zoom: 10.1,
        }
        expect(shouldAnimateWeatherTransition(before, after)).toBe(false)
    })

    test('respects reduced-motion preference', () => {
        const original = window.matchMedia
        window.matchMedia = jest.fn().mockImplementation(() => ({ matches: true }))
        expect(prefersReducedMotion()).toBe(true)
        window.matchMedia = original
    })
})
