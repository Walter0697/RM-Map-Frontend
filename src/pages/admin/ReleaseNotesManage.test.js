import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import ReleaseNotesManage from './ReleaseNotesManage'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { auth: { jwt: 'test-jwt', username: 'admin' } }) {
    return state
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

function setInputValue(input, value) {
    const prototype = input instanceof window.HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
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
                    <ReleaseNotesManage />
                </MemoryRouter>
            </Provider>
        )
    })

    return { container, root }
}

describe('ReleaseNotesManage', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
        document.body.innerHTML = ''
    })

    test('renders admin release notes route content', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => [],
        })

        createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('Release Notes')
        expect(document.body.textContent).toContain('No release notes yet.')
    })

    test('blocks save when version is not greater than app baseline', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => [],
        })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        const versionInput = container.querySelector('input[placeholder="2.9.5"]')
        const contentArea = container.querySelector('textarea')

        act(() => {
            setInputValue(versionInput, '2.9.4')
            setInputValue(contentArea, 'content')
        })

        const saveButton = Array.from(container.querySelectorAll('button')).find((item) => (item.textContent || '').trim() === 'Save')
        act(() => {
            saveButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })
        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('Version must be greater than app version')
    })

    test('uploads image and inserts markdown syntax into content', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => [],
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ path: '/release_notes/test.png', url: '/image/release_notes/test.png' }),
            })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        const fileInput = container.querySelector('input[type="file"]')
        const file = new File(['content'], 'test.png', { type: 'image/png' })

        await act(async () => {
            Object.defineProperty(fileInput, 'files', {
                value: [file],
                writable: false,
            })
            fileInput.dispatchEvent(new Event('change', { bubbles: true }))
            await flushPromises()
        })

        const contentArea = container.querySelector('textarea')
        expect(contentArea.value).toContain('![release-note-image](/image/release_notes/test.png)')
        expect(document.body.textContent).toContain('Image uploaded and inserted into content.')
    })
})
