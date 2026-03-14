import historyMarkerPreview from './historyMarkerPreview'

describe('historyMarkerPreview', () => {
    test('rejects markers without usable coordinates', () => {
        expect(historyMarkerPreview.hasValidCoordinates({ latitude: 0, longitude: 0 })).toBe(false)
        expect(historyMarkerPreview.hasValidCoordinates({ latitude: 91, longitude: 0 })).toBe(false)
        expect(historyMarkerPreview.hasValidCoordinates({ latitude: 22.3, longitude: 114.2 })).toBe(true)
    })

    test('builds deterministic fallback state for markers without coordinates', () => {
        expect(historyMarkerPreview.buildIdlePreviewState({ latitude: 0, longitude: 0 })).toEqual({
            profile: historyMarkerPreview.PROFILE,
            state: 'fallback',
            fallback_reason: 'no_coordinates',
            cache_hit: false,
        })
    })

    test('converts relative image paths into backend image urls', () => {
        expect(historyMarkerPreview.toRenderableImageURL({ image_url: '/previews/test.png' })).toContain('/image/previews/test.png')
    })
})
