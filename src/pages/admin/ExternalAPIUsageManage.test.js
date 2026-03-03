import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import ExternalAPIUsageManage from './ExternalAPIUsageManage'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { auth: { jwt: 'test-jwt', username: 'admin' } }) {
    return state
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

function createRenderedPage(initialEntry = '/admin/api-usage') {
    const store = configureStore({ reducer: rootReducer })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
        root.render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[initialEntry]}>
                    <ExternalAPIUsageManage />
                </MemoryRouter>
            </Provider>
        )
    })

    return { container, root }
}

describe('ExternalAPIUsageManage', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
        document.body.innerHTML = ''
    })

    test('renders summary and provider breakdown from backend payload', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    items: [
                        { id: 'tomtom_map', label: 'TomTom' },
                        { id: 'movie_db', label: 'Movie DB' },
                    ],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    overall: {
                        total_calls: 10,
                        success_count: 8,
                        error_count: 2,
                        avg_latency_ms: 120.5,
                    },
                    providers: [
                        {
                            provider: 'tomtom_map',
                            provider_label: 'TomTom',
                            total_calls: 6,
                            success_count: 5,
                            error_count: 1,
                            avg_latency_ms: 110.0,
                        },
                    ],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    points: [
                        {
                            bucket_start: '2026-03-02T00:00:00Z',
                            total_calls: 4,
                            success_count: 3,
                            error_count: 1,
                            avg_latency_ms: 100,
                        },
                    ],
                }),
            })

        createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('Total Calls')
        expect(document.body.textContent).toContain('10')
        expect(document.body.textContent).toContain('TomTom (tomtom_map)')
    })

    test('sends selected provider from dynamic metadata without hard-coded provider logic', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    items: [
                        { id: 'new_weather_provider', label: 'WeatherX' },
                    ],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ overall: { total_calls: 0, success_count: 0, error_count: 0, avg_latency_ms: 0 }, providers: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ points: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    items: [
                        { id: 'new_weather_provider', label: 'WeatherX' },
                    ],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ overall: { total_calls: 1, success_count: 1, error_count: 0, avg_latency_ms: 42 }, providers: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ points: [] }),
            })

        createRenderedPage('/admin/api-usage?provider=new_weather_provider&interval=1h')
        await act(async () => {
            await flushPromises()
        })

        const summaryURL = global.fetch.mock.calls[1][0]
        expect(summaryURL).toContain('provider=new_weather_provider')
    })
})
