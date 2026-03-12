import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import PreviousMarkerView from './PreviousMarkerView'

const mockListMarkerScheduleGQL = jest.fn()
const mockScheduleQueryResult = { data: { markerschedules: [] }, loading: false, error: null }

jest.mock('@apollo/client', () => {
    const actual = jest.requireActual('@apollo/client')
    return {
        ...actual,
        useLazyQuery: () => [mockListMarkerScheduleGQL, mockScheduleQueryResult],
        useMutation: () => [jest.fn(), { data: null, loading: false, error: null }],
    }
})

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { marker: { eventtypes: [ { value: 'food', icon_path: '/type-icon.png' } ] } }, action) {
    return state
}

describe('PreviousMarkerView', () => {
    beforeEach(() => {
        mockListMarkerScheduleGQL.mockClear()
    })

    test('renders schedule/revoke icon actions for history markers and keeps fallback preview usable', () => {
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

        expect(document.body.textContent).toContain('No saved coordinates for preview.')

        const scheduleButton = document.querySelector('button[aria-label="Schedule marker"]')
        const revokeButton = document.querySelector('button[aria-label="Revoke marker"]')
        expect(scheduleButton).toBeTruthy()
        expect(revokeButton).toBeTruthy()

        act(() => {
            scheduleButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })

        expect(openSchedule).toHaveBeenCalledTimes(1)
        expect(mockListMarkerScheduleGQL).toHaveBeenCalledTimes(1)

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

    test('hides revoke action when allowRevoke is disabled', () => {
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
                            id: 6,
                            type: 'food',
                            label: 'Expired Marker',
                            address: '789 Test Road',
                            description: 'Expired marker should not revoke',
                        }}
                        allowRevoke={false}
                        openSchedule={() => {}}
                    />
                </Provider>
            )
        })

        expect(document.querySelector('button[aria-label="Schedule marker"]')).toBeTruthy()
        expect(document.querySelector('button[aria-label="Revoke marker"]')).toBeFalsy()

        act(() => {
            root.unmount()
        })
        container.remove()
    })

    test('hides history and skips schedule fetch when showHistory is disabled', () => {
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
                            id: 7,
                            type: 'food',
                            label: 'Expired Marker',
                            address: '101 Test Road',
                            description: 'No history expected',
                        }}
                        showHistory={false}
                        allowRevoke={false}
                        openSchedule={() => {}}
                    />
                </Provider>
            )
        })

        expect(document.body.textContent).not.toContain('History:')
        expect(mockListMarkerScheduleGQL).toHaveBeenCalledTimes(0)

        act(() => {
            root.unmount()
        })
        container.remove()
    })
})
