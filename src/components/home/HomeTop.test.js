import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import HomeTop from './HomeTop'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('HomeTop', () => {
    test('renders canonical app title', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(<HomeTop />)
        })

        expect(container.textContent).toContain('RoroadMap')

        act(() => {
            root.unmount()
        })
        container.remove()
    })
})
