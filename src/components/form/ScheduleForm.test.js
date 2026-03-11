import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { render, screen, fireEvent } from '@testing-library/react'

import ScheduleForm from './ScheduleForm'

const mockMutate = jest.fn()

jest.mock('@apollo/client', () => {
    const actual = jest.requireActual('@apollo/client')
    return {
        ...actual,
        useMutation: () => [mockMutate, { data: null, loading: false, error: null }],
    }
})

function rootReducer(state = { auth: { jwt: 'jwt-token' } }, action) {
    return state
}

describe('ScheduleForm', () => {
    test('submits the existing marker_id payload for standard schedule creation', () => {
        mockMutate.mockClear()
        const store = configureStore({ reducer: rootReducer })
        const marker = {
            id: 22,
            label: 'Library',
        }

        render(
            <Provider store={store}>
                <ScheduleForm
                    open={true}
                    handleClose={() => {}}
                    marker={marker}
                />
            </Provider>
        )

        fireEvent.change(screen.getByLabelText(/label/i), { target: { value: 'Library Visit' } })
        fireEvent.change(screen.getByLabelText(/selected time/i), { target: { value: '2030-01-01T09:30' } })
        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Bring notes' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(mockMutate).toHaveBeenCalledTimes(1)
        expect(mockMutate.mock.calls[0][0]).toEqual(expect.objectContaining({
            variables: expect.objectContaining({
                marker_id: 22,
                label: 'Library Visit',
                description: 'Bring notes',
            }),
        }))
    })
})
