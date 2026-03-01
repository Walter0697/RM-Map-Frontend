import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import MarkerView from './MarkerView'

jest.mock('@apollo/client', () => {
    const actual = jest.requireActual('@apollo/client')
    return {
        ...actual,
        useMutation: () => [jest.fn(), { data: null, loading: false, error: null }],
    }
})

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const markerState = {
    eventtypes: [
        { value: 'food', icon_path: '/type-icon.png' },
    ],
}

function testReducer(state = { marker: markerState }, action) {
    return state
}

describe('MarkerView action layout', () => {
    test('renders stable top action row with schedule/preview/favourite actions', () => {
        const store = configureStore({ reducer: testReducer })
        const marker = {
            id: 1,
            type: 'food',
            status: '',
            label: 'Test Marker',
            address: '123 Test Road',
            description: 'marker description',
            need_booking: false,
            permanent: false,
            is_fav: false,
        }

        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        act(() => {
            root.render(
                <Provider store={store}>
                    <MemoryRouter>
                        <MarkerView
                            open={true}
                            handleClose={() => {}}
                            openSchedule={() => {}}
                            marker={marker}
                            editMarker={() => {}}
                        />
                    </MemoryRouter>
                </Provider>
            )
        })

        const actionRow = document.querySelector('[data-testid="marker-view-top-actions"]')
        expect(actionRow).not.toBeNull()
        expect(actionRow.querySelectorAll('button').length).toBeGreaterThanOrEqual(2)

        act(() => {
            root.unmount()
        })
        container.remove()
    })
})
