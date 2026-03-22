import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import SchedulePage from './SchedulePage'

const mockUsePagedDataController = jest.fn()
const mockUseLazyQuery = jest.fn()
const mockBoopTrigger = jest.fn()
let capturedOpenScheduleView = null
let mockAutoOpenFromList = false

jest.mock('../hooks/usePagedDataController', () => (...args) => mockUsePagedDataController(...args))
jest.mock('../hooks/useBoop', () => () => [false, mockBoopTrigger])
jest.mock('@apollo/client', () => ({
    useLazyQuery: (...args) => mockUseLazyQuery(...args),
    gql: (strings) => strings,
}))

jest.mock('./Base', () => ({ children }) => <div data-testid='base'>{children}</div>)

jest.mock('../components/list/ScheduleList', () => (props) => {
    const React = require('react')
    React.useEffect(() => {
        capturedOpenScheduleView = props.openScheduleView
    }, [props.openScheduleView])
    React.useEffect(() => {
        if (!mockAutoOpenFromList) return
        props.openScheduleView([
            {
                id: 900,
                label: 'List Schedule',
                selected_date: '2026-03-07T10:00:00Z',
            },
        ], '2026-03-07', { activeScheduleId: 900 })
    }, [props.openScheduleView])

    return (
        <div>
            <button
                onClick={() => props.openScheduleView([
                    {
                        id: 900,
                        label: 'List Schedule',
                        selected_date: '2026-03-07T10:00:00Z',
                    },
                ], '2026-03-07', { activeScheduleId: 900 })}
            >
                open-from-list
            </button>
        </div>
    )
})

jest.mock('../components/schedule/ScheduleView', () => (props) => (
    <div data-testid='schedule-view'>
        <div>open:{props.open ? 'yes' : 'no'}</div>
        <div>selected-date:{props.selected_date || ''}</div>
        <div>active-id:{props.activeScheduleId || ''}</div>
        <div>count:{props.schedules?.length || 0}</div>
        <div>first-id:{props.schedules?.[0]?.id || ''}</div>
        <button onClick={props.handleClose}>close-view</button>
        <button onClick={props.onRetry}>retry-view</button>
        <button onClick={props.onRefresh}>refresh-view</button>
    </div>
))

jest.mock('../components/schedule/ScheduleExportPanel', () => () => <div data-testid='schedule-export-panel'>export-panel</div>)
jest.mock('../components/schedule/ScheduleArriveForm', () => () => <div />)
jest.mock('../components/form/ScheduleEditForm', () => () => <div />)
jest.mock('../components/AutoHideAlert', () => (props) => (
    props.open ? <div>{props.message}</div> : null
))

const createTestStore = (state) => createStore((s = state) => s)

const baseSchedule = {
    id: 2,
    label: 'Deep Link Schedule',
    selected_date: '2026-03-07T12:00:00Z',
}

const setup = ({
    route = '/schedule',
    pendingDeepLink = null,
    scheduleItems = [baseSchedule],
    lazyQueryImpl = async () => ({ data: { pagedschedules: { items: [], next_cursor: null } } }),
} = {}) => {
    const history = createMemoryHistory({ initialEntries: [route] })
    const store = createTestStore({
        schedule: { schedules: [baseSchedule] },
        deepLink: { pending: pendingDeepLink },
        auth: { jwt: 'test-token' },
    })

    mockUsePagedDataController.mockReturnValue({
        items: scheduleItems,
        nextCursor: null,
        loading: false,
        refreshing: false,
        stale: false,
        offlineCached: false,
        error: null,
        refresh: jest.fn(),
        loadMore: jest.fn(),
        retry: jest.fn(),
    })

    const lazyFn = jest.fn(lazyQueryImpl)
    mockUseLazyQuery.mockReturnValue([lazyFn])

    const ui = render(
        <Provider store={store}>
            <Router history={history}>
                <SchedulePage />
            </Router>
        </Provider>
    )

    return { ...ui, history, lazyFn }
}

beforeEach(() => {
    jest.clearAllMocks()
    capturedOpenScheduleView = null
    mockAutoOpenFromList = false
})

test('list-open action wiring remains stable with dialog lifecycle controls', async () => {
    setup({ route: '/schedule', scheduleItems: [baseSchedule] })

    expect(typeof capturedOpenScheduleView).toBe('function')
    fireEvent.click(screen.getByText('open-from-list'))
    fireEvent.click(screen.getByText('retry-view'))
    fireEvent.click(screen.getByText('refresh-view'))
    fireEvent.click(screen.getByText('close-view'))

    await waitFor(() => {
        expect(screen.getByText('open:no')).toBeInTheDocument()
        expect(screen.getByText('count:0')).toBeInTheDocument()
    })
})

test('plain schedule route does not auto-open from pending deep link intent', async () => {
    const { lazyFn } = setup({
        route: '/schedule',
        pendingDeepLink: {
            resourceType: 'schedule',
            id: '2',
            path: '/schedules/2',
        },
        scheduleItems: [baseSchedule],
    })

    await waitFor(() => {
        expect(screen.getByText('open:no')).toBeInTheDocument()
    })
    expect(lazyFn).not.toHaveBeenCalled()
})

test('deep-link-open lifecycle parity supports close retry and refresh', async () => {
    setup({ route: '/schedules/2', scheduleItems: [baseSchedule] })

    await waitFor(() => {
        expect(screen.getByText('open:yes')).toBeInTheDocument()
        expect(screen.getByText('first-id:2')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('retry-view'))
    fireEvent.click(screen.getByText('refresh-view'))

    await waitFor(() => {
        expect(screen.getByText('open:yes')).toBeInTheDocument()
        expect(screen.getByText('first-id:2')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('close-view'))

    await waitFor(() => {
        expect(screen.getByText('open:no')).toBeInTheDocument()
        expect(screen.getByText('count:0')).toBeInTheDocument()
    })
})

test('invalid deep-link target fails gracefully and keeps list context', async () => {
    const { history } = setup({
        route: '/schedules/999',
        scheduleItems: [],
        lazyQueryImpl: async () => ({
            data: {
                pagedschedules: {
                    items: [],
                    next_cursor: null,
                },
            },
        }),
    })

    await waitFor(() => {
        expect(screen.getByText('open:no')).toBeInTheDocument()
    })

    expect(history.location.pathname).toBe('/schedule')
})

test('rapid deep-link switching ignores stale out-of-order responses', async () => {
    let resolveFirst
    const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve
    })

    const lazyFn = jest.fn()
        .mockImplementationOnce(() => firstPromise)
        .mockImplementationOnce(async () => ({
            data: {
                pagedschedules: {
                    items: [
                        {
                            id: 2,
                            label: 'Second Target',
                            selected_date: '2026-03-07T14:00:00Z',
                        },
                    ],
                    next_cursor: null,
                },
            },
        }))

    const history = createMemoryHistory({ initialEntries: ['/schedules/1'] })
    const store = createTestStore({
        schedule: { schedules: [] },
        deepLink: { pending: null },
        auth: { jwt: 'test-token' },
    })

    mockUsePagedDataController.mockReturnValue({
        items: [],
        nextCursor: null,
        loading: false,
        refreshing: false,
        stale: false,
        offlineCached: false,
        error: null,
        refresh: jest.fn(),
        loadMore: jest.fn(),
        retry: jest.fn(),
    })
    mockUseLazyQuery.mockReturnValue([lazyFn])

    render(
        <Provider store={store}>
            <Router history={history}>
                <SchedulePage />
            </Router>
        </Provider>
    )

    await waitFor(() => expect(lazyFn).toHaveBeenCalledTimes(1))

    act(() => {
        history.push('/schedules/2')
    })

    await waitFor(() => {
        expect(lazyFn).toHaveBeenCalledTimes(2)
        expect(screen.getByText('open:yes')).toBeInTheDocument()
        expect(screen.getByText('first-id:2')).toBeInTheDocument()
    })

    resolveFirst({
        data: {
            pagedschedules: {
                items: [
                    {
                        id: 1,
                        label: 'First Target',
                        selected_date: '2026-03-07T13:00:00Z',
                    },
                ],
                next_cursor: null,
            },
        },
    })

    await waitFor(() => {
        expect(screen.getByText('first-id:2')).toBeInTheDocument()
    })
})
