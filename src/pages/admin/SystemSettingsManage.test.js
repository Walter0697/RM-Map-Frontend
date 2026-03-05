import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import SystemSettingsManage from './SystemSettingsManage'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { auth: { jwt: 'test-jwt', username: 'admin' } }) {
    return state
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

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

function createRenderedPage() {
    const store = configureStore({ reducer: rootReducer })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
        root.render(
            <Provider store={store}>
                <MemoryRouter>
                    <SystemSettingsManage />
                </MemoryRouter>
            </Provider>
        )
    })

    return { container, root }
}

describe('SystemSettingsManage', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
        document.body.innerHTML = ''
    })

    test('loads configured shortcut URL and saves updates', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ios_shortcut_install_url: 'https://www.icloud.com/shortcuts/old',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ios_shortcut_install_url: 'https://www.icloud.com/shortcuts/new',
                }),
            })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('Configured')
        const input = container.querySelector('input[placeholder=\"https://www.icloud.com/shortcuts/...\"]')
        expect(input).toBeTruthy()
        expect(input.value).toBe('https://www.icloud.com/shortcuts/old')

        act(() => {
            setInputValue(input, 'https://www.icloud.com/shortcuts/new')
        })
        clickByText(container, 'button', 'Save', true)

        await act(async () => {
            await flushPromises()
        })

        const saveCall = global.fetch.mock.calls[1]
        expect(saveCall[0]).toContain('/admin/settings/ios-shortcut-install-url')
        expect(saveCall[1].method).toBe('PUT')
        expect(saveCall[1].body).toContain('https://www.icloud.com/shortcuts/new')
        expect(document.body.textContent).toContain('Saved iOS shortcut install URL.')
    })

    test('shows backend validation error when save fails', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ios_shortcut_install_url: '',
                }),
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => 'ios_shortcut_install_url must be a valid absolute http or https URL',
            })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        const input = container.querySelector('input[placeholder=\"https://www.icloud.com/shortcuts/...\"]')
        act(() => {
            setInputValue(input, 'https://example.com/shortcut')
        })
        clickByText(container, 'button', 'Save', true)

        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('ios_shortcut_install_url must be a valid absolute http or https URL')
    })
})
