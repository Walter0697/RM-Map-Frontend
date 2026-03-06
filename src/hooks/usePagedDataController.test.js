import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import usePagedDataController from './usePagedDataController'

function Harness({ fetchPage }) {
    const controller = usePagedDataController({
        resource: 'test_resource',
        queryIdentity: { query: 'demo' },
        fetchPage,
        ttlMs: 60 * 1000,
    })

    return (
        <div>
            <div data-testid='count'>{controller.items.length}</div>
            <div data-testid='next'>{controller.nextCursor || ''}</div>
            <div data-testid='error'>{controller.error ? 'yes' : 'no'}</div>
            <button onClick={() => controller.refresh()}>refresh</button>
            <button onClick={() => controller.loadMore()}>loadMore</button>
            <button onClick={() => controller.retry()}>retry</button>
        </div>
    )
}

describe('usePagedDataController', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    test('loads pages continuously and dedupes items', async () => {
        const fetchPage = jest.fn(async (cursor) => {
            if (!cursor) {
                return {
                    items: [{ id: 1 }, { id: 2 }],
                    nextCursor: '2',
                }
            }
            return {
                items: [{ id: 2 }, { id: 3 }],
                nextCursor: null,
            }
        })

        render(<Harness fetchPage={fetchPage} />)

        fireEvent.click(screen.getByText('refresh'))
        await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('2'))
        expect(screen.getByTestId('next').textContent).toBe('2')

        fireEvent.click(screen.getByText('loadMore'))
        await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('3'))
        expect(screen.getByTestId('next').textContent).toBe('')
    })

    test('handles empty states', async () => {
        const fetchPage = jest.fn(async () => ({ items: [], nextCursor: null }))
        render(<Harness fetchPage={fetchPage} />)

        fireEvent.click(screen.getByText('refresh'))
        await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'))
        expect(screen.getByTestId('next').textContent).toBe('')
        expect(screen.getByTestId('error').textContent).toBe('no')
    })

    test('supports retry after failed request', async () => {
        let first = true
        const fetchPage = jest.fn(async () => {
            if (first) {
                first = false
                throw new Error('temporary failure')
            }
            return {
                items: [{ id: 42 }],
                nextCursor: null,
            }
        })

        render(<Harness fetchPage={fetchPage} />)

        fireEvent.click(screen.getByText('refresh'))
        await waitFor(() => expect(screen.getByTestId('error').textContent).toBe('yes'))

        fireEvent.click(screen.getByText('retry'))
        await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'))
        expect(screen.getByTestId('error').textContent).toBe('no')
    })
})
