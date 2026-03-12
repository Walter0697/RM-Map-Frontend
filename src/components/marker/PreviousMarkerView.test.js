import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import PreviousMarkerView from './PreviousMarkerView'

const mockScheduleQueryResult = { data: { markerschedules: [] }, loading: false, error: null }

jest.mock('@apollo/client', () => {
    const actual = jest.requireActual('@apollo/client')
    return {
        ...actual,
        useLazyQuery: () => [jest.fn(), mockScheduleQueryResult],
        useMutation: () => [jest.fn(), { data: null, loading: false, error: null }],
    }
})

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { marker: { eventtypes: [ { value: 'food', icon_path: '/type-icon.png' } ] } }, action) {
    return state
}

describe('PreviousMarkerView', () => {
    test('renders schedule action for history markers and keeps fallback preview usable', () => {
        const store = configureStore({ reducer: rootReducer })
        const openSchedule = jest.fn()
        const marker = {
            id: 4,
            type: 'food',
            label: 'Old Favourite',
            address: '123 Test Road',
            description: 'Visited before',
            history_preview: {
                state: 'fallback',
                fallback_reason: 'no_coordinates',
            },
        }

        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <Provider store={store}>
                    <PreviousMarkerView
                        open={true}
                        handleClose={() => {}}
                        marker={marker}
                        openSchedule={openSchedule}
                    />
                </Provider>
            )
        })

        expect(document.body.textContent).toContain('Schedule this marker')
        expect(document.body.textContent).toContain('No saved coordinates for preview.')

        const scheduleButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('Schedule this marker'))
        expect(scheduleButton).toBeTruthy()

        act(() => {
            scheduleButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })

        expect(openSchedule).toHaveBeenCalledTimes(1)

        act(() => {
            root.unmount()
        })
        container.remove()
    })

    test('renders marker image before map preview when both are available', () => {
        const store = configureStore({ reducer: rootReducer })
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <Provider store={store}>
                    <PreviousMarkerView
                        open={true}
                        handleClose={() => {}}
                        marker={{
                            id: 5,
                            type: 'food',
                            label: 'Saved Photo Spot',
                            address: '456 Test Road',
                            description: 'Has image',
                            image_link: '/markers/photo.png',
                            history_preview: {
                                state: 'ready',
                                image_src: 'https://example.com/map-preview.png',
                            },
                        }}
                        openSchedule={() => {}}
                    />
                </Provider>
            )
        })

        expect(document.body.textContent).toContain('Saved marker image')
        const images = Array.from(document.querySelectorAll('img'))
        expect(images.some((node) => node.getAttribute('alt') === 'Saved Photo Spot saved marker')).toBe(true)
        expect(images.some((node) => node.getAttribute('alt') === 'Saved Photo Spot history preview')).toBe(true)
        const markerImageIndex = images.findIndex((node) => node.getAttribute('alt') === 'Saved Photo Spot saved marker')
        const mapPreviewIndex = images.findIndex((node) => node.getAttribute('alt') === 'Saved Photo Spot history preview')
        expect(markerImageIndex).toBeLessThan(mapPreviewIndex)

        act(() => {
            root.unmount()
        })
        container.remove()
    })
})
