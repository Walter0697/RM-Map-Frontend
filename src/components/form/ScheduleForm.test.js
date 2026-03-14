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

jest.mock('./ScheduleDateTimeSelector', () => (props) => {
    const {
        onValueChange,
    } = props
    return (
        <input
            aria-label='selected time'
            onChange={(event) => onValueChange(new Date(event.target.value))}
        />
    )
})

jest.mock('./ScheduleWeatherPreview', () => () => <div data-testid='weather-preview' />)

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

    test('supports marker_id fallback when marker.id is missing', () => {
        mockMutate.mockClear()
        const store = configureStore({ reducer: rootReducer })
        const marker = {
            marker_id: 35,
            label: 'History Marker',
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

        fireEvent.change(screen.getByLabelText(/label/i), { target: { value: 'History Visit' } })
        fireEvent.change(screen.getByLabelText(/selected time/i), { target: { value: '2030-01-01T11:00' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(mockMutate).toHaveBeenCalledTimes(1)
        expect(mockMutate.mock.calls[0][0]).toEqual(expect.objectContaining({
            variables: expect.objectContaining({
                marker_id: 35,
            }),
        }))
    })

    test('blocks submission when marker id is invalid', () => {
        mockMutate.mockClear()
        const store = configureStore({ reducer: rootReducer })
        const marker = {
            label: 'Invalid Marker',
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

        fireEvent.change(screen.getByLabelText(/label/i), { target: { value: 'Attempt Schedule' } })
        fireEvent.change(screen.getByLabelText(/selected time/i), { target: { value: '2030-01-01T12:00' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(mockMutate).not.toHaveBeenCalled()
        expect(screen.getByText('selected marker is invalid')).toBeTruthy()
    })
})
