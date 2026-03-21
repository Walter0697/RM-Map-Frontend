import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import dayjs from 'dayjs'

import ScheduleView from './ScheduleView'

const mockHistoryPush = jest.fn()

jest.mock('@apollo/client', () => {
    const actual = jest.requireActual('@apollo/client')
    return {
        ...actual,
        useMutation: () => [jest.fn(), { data: null, loading: false, error: null }],
    }
})

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom')
    return {
        ...actual,
        useHistory: () => ({
            push: mockHistoryPush,
        }),
    }
})

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { auth: { jwt: '' } }, action) {
    return state
}

describe('ScheduleView layout contracts', () => {
    beforeEach(() => {
        mockHistoryPush.mockReset()
    })

    test('renders schedule content and arrived action for today', () => {
        const store = configureStore({ reducer: rootReducer })
        const today = dayjs().format('YYYY-MM-DD')
        const schedules = [
            {
                id: 1,
                selected_date: `${today}T09:00:00Z`,
                status: '',
                image_path: '/test.png',
                label: 'Morning Commute',
                description: 'Take train to office',
                marker: {
                    label: 'Central Station',
                    address: 'Station Road',
                    link: '',
                    restaurant: null,
                },
                movie: null,
            },
        ]

        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <Provider store={store}>
                    <ScheduleView
                        open={true}
                        handleClose={() => {}}
                        schedules={schedules}
                        selected_date={today}
                        activeScheduleId={1}
                        fetchStatus='success'
                        fetchError=''
                        onRetry={() => {}}
                        onRefresh={() => {}}
                        openArriveForm={() => {}}
                        openEditForm={() => {}}
                    />
                </Provider>
            )
        })

        expect(document.body.textContent).toContain('Morning Commute')
        expect(document.body.textContent).toContain('Take train to office')
        expect(document.body.textContent).toContain('Arrived')

        act(() => {
            root.unmount()
        })
        container.remove()
    })

    test('renders calendar sync controls and queues sync action', async () => {
        const store = configureStore({ reducer: () => ({ auth: { jwt: 'jwt-token' } }) })
        const today = dayjs().format('YYYY-MM-DD')
        const schedules = [
            {
                id: 2,
                selected_date: `${today}T10:00:00Z`,
                status: '',
                image_path: '/test2.png',
                label: 'Sync Item',
                description: 'Needs calendar sync',
                marker: {
                    id: 12,
                    label: 'Marker 12',
                    address: 'Address 12',
                    link: '',
                    restaurant: null,
                },
                movie: null,
            },
        ]

        const fetchMock = jest.fn()
        fetchMock.mockImplementation((url, options = {}) => {
            const normalized = String(url)
            if (normalized.includes('/schedules/travel-analysis')) {
                return Promise.resolve({ ok: true, json: async () => ({ transition_analysis: [] }) })
            }
            if (normalized.includes('/calendar/providers/status')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ items: [{ provider_key: 'google_calendar', status: 'active' }] }),
                })
            }
            if (normalized.includes('/calendar/schedules/status')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        items: [
                            {
                                schedule_id: 2,
                                provider_key: 'google_calendar',
                                sync_status: 'failed',
                                last_error_message: 'Token expired',
                            },
                        ],
                    }),
                })
            }
            if (normalized.includes('/calendar/schedules/2/sync-now') && options.method === 'POST') {
                return Promise.resolve({ ok: true, json: async () => ({ status: 'queued' }) })
            }
            return Promise.resolve({ ok: true, json: async () => ({}) })
        })
        global.fetch = fetchMock

        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        await act(async () => {
            root.render(
                <Provider store={store}>
                    <ScheduleView
                        open={true}
                        handleClose={() => {}}
                        schedules={schedules}
                        selected_date={today}
                        openArriveForm={() => {}}
                        openEditForm={() => {}}
                    />
                </Provider>
            )
        })

        expect(document.body.textContent).toContain('Sync failed')
        expect(document.body.textContent).toContain('Token expired')

        const syncButton = document.querySelector('button[aria-label="sync whole schedule"]')
        expect(syncButton).toBeTruthy()

        await act(async () => {
            syncButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })

        const syncCall = fetchMock.mock.calls.find((call) => String(call[0]).includes('/calendar/schedules/2/sync-now'))
        expect(syncCall).toBeTruthy()

        act(() => {
            root.unmount()
        })
        container.remove()
    })

    test('renders open marker action when marker id exists and routes to marker page', () => {
        const store = configureStore({ reducer: rootReducer })
        const today = dayjs().format('YYYY-MM-DD')
        const schedules = [
            {
                id: 3,
                selected_date: `${today}T10:00:00Z`,
                status: '',
                image_path: '/test3.png',
                label: 'Marker Route Item',
                description: 'Has marker id',
                marker: {
                    id: 15,
                    label: 'Marker 15',
                    address: 'Address 15',
                    restaurant: null,
                },
            },
        ]

        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <Provider store={store}>
                    <ScheduleView
                        open={true}
                        handleClose={() => {}}
                        schedules={schedules}
                        selected_date={today}
                        activeScheduleId={3}
                        fetchStatus='success'
                        fetchError=''
                        onRetry={() => {}}
                        onRefresh={() => {}}
                        openArriveForm={() => {}}
                        openEditForm={() => {}}
                    />
                </Provider>
            )
        })

        const markerButton = document.querySelector('button[aria-label="open marker 15"]')
        expect(markerButton).toBeTruthy()

        act(() => {
            markerButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })

        expect(mockHistoryPush).toHaveBeenCalledWith('/marker/15')

        act(() => {
            root.unmount()
        })
        container.remove()
    })
})
