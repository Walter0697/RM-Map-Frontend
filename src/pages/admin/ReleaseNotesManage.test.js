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

    test('uses current app version for new draft by default', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => [],
        })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        const versionInput = container.querySelector('input[placeholder="3.0.0"]')
        expect(versionInput.value).toBe('3.0.0')
        expect(versionInput.disabled).toBe(true)
        expect(document.body.textContent).toContain('New draft uses the current app version.')
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
