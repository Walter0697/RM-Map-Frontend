import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import TravelPlansPage from './TravelPlansPage'

jest.mock('./Base', () => ({ children }) => <div data-testid='base'>{children}</div>)
jest.mock('../components/topbar/TopBar', () => () => <div data-testid='topbar'>topbar</div>)

const createTestStore = () => createStore((state = { auth: { jwt: 'test-jwt' } }) => state)

function jsonResponse(payload, status = 200) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: async () => payload,
        text: async () => JSON.stringify(payload),
    })
}

function setup() {
    const history = createMemoryHistory({ initialEntries: ['/travel-plans'] })
    const store = createTestStore()
    render(
        <Provider store={store}>
            <Router history={history}>
                <TravelPlansPage />
            </Router>
        </Provider>
    )
}

describe('TravelPlansPage', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
        window.confirm = jest.fn(() => true)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    test('deletes plan and refreshes list', async () => {
        global.fetch
            .mockImplementationOnce(() => jsonResponse({
                items: [{ id: 1, title: 'Tokyo Plan', start_date: '2026-03-20', end_date: '2026-03-25' }],
            }))
            .mockImplementationOnce(() => jsonResponse({
                id: 1,
                title: 'Tokyo Plan',
                daily_plans: [],
            }))
            .mockImplementationOnce(() => jsonResponse({ deleted: true, entity: 'travel_plan', id: 1 }))
            .mockImplementationOnce(() => jsonResponse({ items: [] }))

        setup()

        await waitFor(() => expect(screen.getByText('Tokyo Plan')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Tokyo Plan'))
        await waitFor(() => expect(screen.getByText('No items.')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Delete Plan'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/travel-plans/1'),
                expect.objectContaining({ method: 'DELETE' })
            )
        })

        await waitFor(() => expect(screen.getByText('No travel plans yet.')).toBeInTheDocument())
    })

    test('deletes plan item and refreshes detail', async () => {
        global.fetch
            .mockImplementationOnce(() => jsonResponse({
                items: [{ id: 1, title: 'Kyoto Plan', start_date: '2026-04-01', end_date: '2026-04-04' }],
            }))
            .mockImplementationOnce(() => jsonResponse({
                id: 1,
                title: 'Kyoto Plan',
                daily_plans: [{ id: 5, day_index: 1, summary: 'Arashiyama walk', local_date: '2026-04-01' }],
            }))
            .mockImplementationOnce(() => jsonResponse({ deleted: true, entity: 'travel_plan_daily', id: 5, travel_plan_id: 1 }))
            .mockImplementationOnce(() => jsonResponse({
                items: [{ id: 1, title: 'Kyoto Plan', start_date: '2026-04-01', end_date: '2026-04-04' }],
            }))
            .mockImplementationOnce(() => jsonResponse({
                id: 1,
                title: 'Kyoto Plan',
                daily_plans: [],
            }))

        setup()

        await waitFor(() => expect(screen.getByText('Kyoto Plan')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Kyoto Plan'))

        await waitFor(() => expect(screen.getByText('Day 1 · 2026-04-01')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Delete Item'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/travel-plans/1/daily-plans/5'),
                expect.objectContaining({ method: 'DELETE' })
            )
        })

        await waitFor(() => expect(screen.getByText('No items.')).toBeInTheDocument())
    })
})
