import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import dayjs from 'dayjs'

import ScheduleView from './ScheduleView'

jest.mock('@apollo/client', () => {
    const actual = jest.requireActual('@apollo/client')
    return {
        ...actual,
        useMutation: () => [jest.fn(), { data: null, loading: false, error: null }],
    }
})

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { auth: { jwt: '' } }, action) {
    return state
}

describe('ScheduleView layout contracts', () => {
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
})
