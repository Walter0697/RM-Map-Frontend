import React from 'react'
import { render, screen } from '@testing-library/react'
import RestaurantCard from './RestaurantCard'

describe('RestaurantCard', () => {
    test('renders normalized OpenRice rating JSON safely', () => {
        render(
            <RestaurantCard
                restaurant={{
                    name: 'OpenRice Demo',
                    address: 'Hong Kong',
                    rating: JSON.stringify({ like: '10', average: '2', dislike: '1' }),
                }}
            />
        )
        expect(screen.getByText('OpenRice Demo')).toBeInTheDocument()
        expect(screen.getByText(/Like 10/)).toBeInTheDocument()
    })

    test('renders plain-text Yelp rating without crashing', () => {
        render(
            <RestaurantCard
                restaurant={{
                    name: 'Yelp Demo',
                    address: 'North York',
                    rating: '4.5',
                }}
            />
        )
        expect(screen.getByText('Yelp Demo')).toBeInTheDocument()
        expect(screen.getByText('4.5')).toBeInTheDocument()
    })
})
