import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'

import MarkerList from './MarkerList'

jest.mock('react-redux', () => ({
    connect: () => (Component) => Component,
}))

jest.mock('react-virtuoso', () => ({
    Virtuoso: ({ data, itemContent, components, scrollerRef, style }) => {
        const mockReact = require('react')

        mockReact.useEffect(() => {
            if (scrollerRef) {
                scrollerRef({
                    scrollTop: 0,
                    clientHeight: 400,
                    scrollHeight: 800,
                    addEventListener: () => {},
                    removeEventListener: () => {},
                })
            }
        }, [scrollerRef])

        const Footer = components?.Footer
        return (
            <div data-testid='virtuoso' style={style}>
                {data.map((item, index) => (
                    <div key={item.id}>{itemContent(index, item)}</div>
                ))}
                {Footer ? <Footer /> : null}
            </div>
        )
    },
}))

const markers = [
    {
        id: 1,
        label: 'Alpha Marker',
        address: '123 Test Road',
        description: 'First marker description',
        image_link: '',
        status: '',
        permanent: true,
        need_booking: false,
        is_fav: false,
        type: 'food',
    },
    {
        id: 2,
        label: 'Beta Marker',
        address: '456 Grid Street',
        description: 'Second marker description',
        image_link: '',
        status: '',
        permanent: false,
        need_booking: true,
        is_fav: true,
        type: 'food',
    },
]

describe('MarkerList', () => {
    test('switches between list and grid layouts', () => {
        render(
            <MarkerList
                top='0'
                height='500px'
                markers={markers}
                setSelectedById={() => {}}
                eventtypes={[{ value: 'food', icon_path: '/pin/food.png' }]}
            />
        )

        expect(screen.getByTestId('virtuoso')).toBeInTheDocument()
        fireEvent.click(screen.getByLabelText('Switch to grid view'))
        expect(screen.queryByTestId('virtuoso')).not.toBeInTheDocument()
        expect(screen.getByText('Alpha Marker')).toBeInTheDocument()
        expect(screen.getByText('Beta Marker')).toBeInTheDocument()
        fireEvent.click(screen.getByLabelText('Switch to list view'))
        expect(screen.getByTestId('virtuoso')).toBeInTheDocument()
    })
})
