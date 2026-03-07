import viewportState from './viewportState'

describe('viewportState', () => {
    test('deriveViewportCountrySelection returns all for single country viewport', () => {
        const result = viewportState.deriveViewportCountrySelection([
            { id: 1, country_code: 'HK' },
            { id: 2, country_code: 'HK' },
        ])

        expect(result).toEqual({
            countryCode: 'HK',
            countryPart: { type: 'all' },
        })
    })

    test('deriveViewportCountrySelection returns viewport mode for mixed countries', () => {
        const result = viewportState.deriveViewportCountrySelection([
            { id: 1, country_code: 'HK' },
            { id: 2, country_code: 'CA' },
            { id: 3, country_code: 'HK' },
        ])

        expect(result).toEqual({
            countryCode: 'HK',
            countryPart: { type: 'viewport', name: 'In View' },
        })
    })

    test('buildMapLocations marks selected marker', () => {
        const maphelper = {
            pins: {
                getPinType: jest.fn(() => 'pin'),
            },
        }
        const output = viewportState.buildMapLocations([
            { id: 1, type: 'food', longitude: 1, latitude: 2 },
            { id: 2, type: 'movie', longitude: 3, latitude: 4 },
        ], 2, maphelper)

        expect(output[0].selected).toBe(false)
        expect(output[1].selected).toBe(true)
    })

    test('reconcileSelectedMarker returns clear reason when marker is missing', () => {
        const result = viewportState.reconcileSelectedMarker(9, [{ id: 1 }, { id: 2 }])
        expect(result).toEqual({
            marker: null,
            shouldClear: true,
            reason: 'missing_in_latest_dataset',
        })
    })

    test('pan scenario: viewport country selection switches when dominant country changes', () => {
        const initial = viewportState.deriveViewportCountrySelection([
            { id: 1, country_code: 'HK' },
            { id: 2, country_code: 'HK' },
        ])
        const afterPan = viewportState.deriveViewportCountrySelection([
            { id: 3, country_code: 'CA' },
            { id: 4, country_code: 'CA' },
        ])

        expect(initial).toEqual({
            countryCode: 'HK',
            countryPart: { type: 'all' },
        })
        expect(afterPan).toEqual({
            countryCode: 'CA',
            countryPart: { type: 'all' },
        })
    })

    test('in-flight scenario: selected marker remains valid when latest data still contains marker', () => {
        const result = viewportState.reconcileSelectedMarker(7, [
            { id: 7, label: 'selected' },
            { id: 8, label: 'other' },
        ])

        expect(result.shouldClear).toBe(false)
        expect(result.marker).toEqual({ id: 7, label: 'selected' })
    })
})
