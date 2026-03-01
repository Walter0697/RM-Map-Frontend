import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import PermanentCleanupManage, { normalizeCleanupSortBy } from './PermanentCleanupManage'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { auth: { jwt: 'test-jwt', username: 'admin' } }) {
    return state
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

function createRenderedPage() {
    const store = configureStore({ reducer: rootReducer })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
        root.render(
            <Provider store={store}>
                <MemoryRouter>
                    <PermanentCleanupManage />
                </MemoryRouter>
            </Provider>
        )
    })

    return { container, root }
}

function setInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
}

function clickByText(container, tag, text, exact = false) {
    const candidates = Array.from(container.querySelectorAll(tag))
    const found = candidates.find((item) => {
        const content = (item.textContent || '').trim()
        return exact ? content === text : content.includes(text)
    })
    if (!found) {
        throw new Error(`cannot find ${tag} with text: ${text}`)
    }
    act(() => {
        found.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
}

describe('PermanentCleanupManage', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
        document.body.innerHTML = ''
    })

    test('shows admin route warning when backend returns forbidden', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
            text: async () => 'permission denied',
        })

        createRenderedPage()

        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('This admin route requires authenticated admin permissions.')
    })

    test('sends search query and enforces explicit delete confirmation', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    items: [
                        {
                            id: 12,
                            label: 'Marker Alpha',
                            type: 'food',
                            status: '',
                            relation_id: 4,
                            country_code: 'JP',
                            updated_at: '2026-03-01T10:00:00Z',
                        },
                    ],
                    total: 1,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    items: [
                        {
                            id: 12,
                            label: 'Marker Alpha',
                            type: 'food',
                            status: '',
                            relation_id: 4,
                            country_code: 'JP',
                            updated_at: '2026-03-01T10:00:00Z',
                        },
                    ],
                    total: 1,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ status: 'deleted', entity_type: 'marker', id: 12 }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ items: [], total: 0 }),
            })

        const { container } = createRenderedPage()

        await act(async () => {
            await flushPromises()
        })
        expect(document.body.textContent).toContain('#12 Marker Alpha')

        const searchInput = container.querySelector('input[placeholder="label, description, address"]')
        act(() => {
            setInputValue(searchInput, 'alpha')
        })
        await act(async () => {
            await flushPromises()
        })

        clickByText(container, 'button', 'Search', true)

        await act(async () => {
            await flushPromises()
        })
        const searchCall = global.fetch.mock.calls[1][0]
        expect(searchCall).toContain('search=alpha')

        clickByText(container, 'button', 'Permanently Delete', true)

        await act(async () => {
            await flushPromises()
        })

        const dialog = document.querySelector('[role=\"dialog\"]')
        const confirmInput = dialog.querySelector('input')

        act(() => {
            setInputValue(confirmInput, 'Marker Alpha')
        })

        clickByText(document.body, 'button', 'Delete Permanently', true)

        await act(async () => {
            await flushPromises()
        })

        const deleteCall = global.fetch.mock.calls[2]
        expect(deleteCall[1].method).toBe('DELETE')
        expect(deleteCall[1].body).toContain('"confirm_label":"Marker Alpha"')
    })

    test('schedule sort key is normalized when entity becomes marker', () => {
        expect(normalizeCleanupSortBy('schedule', 'selected_date')).toBe('selected_date')
        expect(normalizeCleanupSortBy('marker', 'selected_date')).toBe('updated_at')
    })
})
