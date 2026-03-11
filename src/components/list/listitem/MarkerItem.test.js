import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import MarkerItem from './MarkerItem'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const marker = {
    id: 1,
    label: 'Test Marker',
    address: '123 Test Road',
    description: 'Long marker description for list visibility check',
    image_link: '',
    status: '',
    permanent: true,
    need_booking: true,
    is_fav: false,
}

describe('MarkerItem', () => {
    test('renders marker title and metadata text', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <MarkerItem
                    item={marker}
                    typeIcon='/pin/test.png'
                    onClickHandler={() => {}}
                />
            )
        })

        expect(container.textContent).toContain('Test Marker')
        expect(container.textContent).toContain('123 Test Road')
        expect(container.textContent).toContain('Long marker description for list visibility check')

        act(() => {
            root.unmount()
        })
        container.remove()
    })

    test('renders history preview fallback copy when map preview is unavailable', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <MarkerItem
                    item={{
                        ...marker,
                        history_preview: {
                            state: 'fallback',
                            fallback_reason: 'no_coordinates',
                        },
                    }}
                    typeIcon='/pin/test.png'
                    onClickHandler={() => {}}
                />
            )
        })

        expect(container.textContent).toContain('No map preview')

        act(() => {
            root.unmount()
        })
        container.remove()
    })
})
