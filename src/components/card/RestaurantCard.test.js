import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RestaurantCard from './RestaurantCard'

describe('RestaurantCard', () => {
    test('renders normalized OpenRice rating JSON safely', () => {
        render(
            <RestaurantCard
                restaurant={{
                    name: 'OpenRice Demo',
                    address: 'Hong Kong',
                    source: 'openrice',
                    source_id: 'hk/kowloon/abc123',
                    website: 'https://www.openrice.com/en/hongkong/r-demo',
                    rating: JSON.stringify({ like: '10', average: '2', dislike: '1' }),
                }}
            />
        )
        expect(screen.getByText('OpenRice Demo')).toBeInTheDocument()
        expect(screen.getByText('OpenRice')).toBeInTheDocument()
        expect(screen.getByText(/Like 10/)).toBeInTheDocument()
    })

    test('renders plain-text Yelp rating without crashing', () => {
        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
        render(
            <RestaurantCard
                restaurant={{
                    name: 'Yelp Demo',
                    address: 'North York',
                    source: 'yelp',
                    source_id: 'bindia-indian-bistro-toronto',
                    website: 'https://www.yelp.com/biz/bindia-indian-bistro-toronto',
                    rating: '4.5',
                }}
            />
        )
        expect(screen.getByText('Yelp Demo')).toBeInTheDocument()
        expect(screen.getByText('Yelp')).toBeInTheDocument()
        expect(screen.getByText('4.5')).toBeInTheDocument()
        fireEvent.click(screen.getByLabelText('Open restaurant website'))
        expect(openSpy).toHaveBeenCalledWith(
            'https://www.yelp.com/biz/bindia-indian-bistro-toronto',
            '_blank',
            'noopener,noreferrer'
        )
        openSpy.mockRestore()
    })
})
