import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import ApiKeyManage from './ApiKeyManage'

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
                    <ApiKeyManage />
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

describe('ApiKeyManage testing flag', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
        document.body.innerHTML = ''
    })

    test('renders testing indicator in list and sends testing=true on create', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    items: [
                        {
                            id: 9,
                            name: 'integration-bot',
                            testing: true,
                            status: 'active',
                            scopes: ['markers:read'],
                            relation_id: 1,
                            actor_user_id: 1,
                        },
                    ],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    users: [{ id: 1, username: 'admin', role: 'admin' }],
                    relations: [{ id: 1, display: 'admin <-> user' }],
                    service_accounts: [{ id: 7, name: 'integration-bot', role: 'admin', relation_id: 1, active: true }],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ items: [{ id: 7, name: 'integration-bot', role: 'admin', relation_id: 1, active: true }] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({
                    token: 'new-token',
                    api_key: { name: 'qa-key' },
                }),
            })
            .mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    status: 'ok',
                    items: [{ id: 7, name: 'integration-bot', role: 'admin', relation_id: 1, active: true }],
                    users: [{ id: 1, username: 'admin', role: 'admin' }],
                    relations: [{ id: 1, display: 'admin <-> user' }],
                    service_accounts: [{ id: 7, name: 'integration-bot', role: 'admin', relation_id: 1, active: true }],
                }),
            })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('testing')

        clickByText(container, 'button', 'New API Key', true)
        await act(async () => {
            await flushPromises()
        })

        const keyNameInput = Array.from(document.querySelectorAll('input')).find((item) => item.getAttribute('placeholder') === 'e.g. deploy-bot-prod')
        act(() => {
            setInputValue(keyNameInput, 'qa-key')
        })

        const testingCheckbox = Array.from(document.querySelectorAll('input[type="checkbox"]')).find((item) => {
            const label = item.closest('label')
            return !!label && (label.textContent || '').includes('Testing key')
        })
        act(() => {
            testingCheckbox.click()
        })

        clickByText(document.body, 'button', 'Generate API Key', true)
        await act(async () => {
            await flushPromises()
        })

        const createCall = global.fetch.mock.calls.find((call) => call[0].includes('/apikeys') && call[1]?.method === 'POST')
        expect(createCall).toBeTruthy()
        expect(createCall[1].body).toContain('"testing":true')
    })
})
