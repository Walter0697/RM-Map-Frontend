import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import HistoryMarkerItem from './HistoryMarkerItem'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const marker = {
    id: 1,
    label: 'History Marker',
    address: '123 Test Road',
    description: 'Long marker description for history list visibility check',
    image_link: '/markers/test-image.png',
    status: '',
    permanent: true,
    need_booking: true,
    is_fav: false,
}

describe('HistoryMarkerItem', () => {
    test('renders marker image on left and map preview on right when both are available', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <HistoryMarkerItem
                    item={{
                        ...marker,
                        history_preview: {
                            state: 'ready',
                            image_src: 'https://example.com/map-preview.png',
                        },
                    }}
                    typeIcon='/pin/test.png'
                    onClickHandler={() => {}}
                />
            )
        })

        const images = container.querySelectorAll('img')
        const altValues = Array.from(images).map((node) => node.getAttribute('alt'))
        const markerImageIndex = altValues.indexOf('History Marker marker image')
        const mapPreviewIndex = altValues.indexOf('History Marker map preview')
        expect(markerImageIndex).toBeGreaterThanOrEqual(0)
        expect(mapPreviewIndex).toBeGreaterThanOrEqual(0)
        expect(markerImageIndex).toBeLessThan(mapPreviewIndex)

        act(() => {
            root.unmount()
        })
        container.remove()
    })
})
