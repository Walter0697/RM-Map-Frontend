import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import PreferredPin from './PreferredPin'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('PreferredPin layout', () => {
    test('renders four pin slots in a 2x2 contract', () => {
        const preferredPinList = [
            { exist: false, label: 'Pin A' },
            { exist: false, label: 'Pin B' },
            { exist: false, label: 'Pin C' },
            { exist: false, label: 'Pin D' },
        ]

        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <PreferredPin
                    preferredPinList={preferredPinList}
                    openPreferredPinChange={() => {}}
                />
            )
        })

        expect(container.textContent).toContain('Pin A')
        expect(container.textContent).toContain('Pin B')
        expect(container.textContent).toContain('Pin C')
        expect(container.textContent).toContain('Pin D')
        expect(container.querySelectorAll('button').length).toBe(4)

        act(() => {
            root.unmount()
        })
        container.remove()
    })
})
