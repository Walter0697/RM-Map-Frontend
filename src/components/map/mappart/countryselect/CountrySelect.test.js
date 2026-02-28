import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import CountrySelect from './CountrySelect'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const initialMarkerState = {
    markers: [],
    eventtypes: [],
    mappins: [],
    countrycodes: [
        { country_code: 'HK', country_name: 'Hong Kong' },
        { country_code: 'JP', country_name: 'Japan' },
    ],
    countryparts: {
        HK: ['Kowloon', 'Hong Kong Island'],
        JP: ['Tokyo'],
    },
    filtercountry: {
        countryCode: 'HK',
        countryPart: {
            type: 'all',
        },
    },
}

function markerTestReducer(state = initialMarkerState, action) {
    if (action.type === 'RESET_FILTERCOUNTRY') {
        return {
            ...state,
            filtercountry: action.filtered,
        }
    }
    return state
}

function renderCountrySelect(preloadedMarkerState = {}) {
    const store = configureStore({
        reducer: {
            marker: markerTestReducer,
        },
        preloadedState: {
            marker: {
                ...initialMarkerState,
                ...preloadedMarkerState,
            },
        },
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
        root.render(
            <Provider store={store}>
                <MemoryRouter>
                    <CountrySelect />
                </MemoryRouter>
            </Provider>
        )
    })

    return {
        store,
        container,
        unmount: () => {
            act(() => {
                root.unmount()
            })
            container.remove()
        },
    }
}

function click(element) {
    act(() => {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
}

describe('CountrySelect interaction guard', () => {
    test('keeps closed dropdown surfaces non-interactive while triggers remain interactive', () => {
        const { container, unmount } = renderCountrySelect()

        const root = container.querySelector('[data-testid="country-select-root"]')
        const codeTrigger = container.querySelector('[data-testid="country-code-trigger"]')
        const partTrigger = container.querySelector('[data-testid="country-part-trigger"]')
        const codeMenu = container.querySelector('[data-testid="country-code-menu"]')
        const partMenu = container.querySelector('[data-testid="country-part-menu"]')

        expect(root.style.pointerEvents).toBe('none')
        expect(codeTrigger.style.pointerEvents).toBe('auto')
        expect(partTrigger.style.pointerEvents).toBe('auto')
        expect(codeMenu.style.pointerEvents).toBe('none')
        expect(partMenu.style.pointerEvents).toBe('none')

        unmount()
    })

    test('opens dropdown via trigger and applies selected option', () => {
        const { container, store, unmount } = renderCountrySelect()

        const partTrigger = container.querySelector('[data-testid="country-part-trigger"]')
        const partMenu = container.querySelector('[data-testid="country-part-menu"]')

        click(partTrigger)
        expect(partMenu.style.pointerEvents).toBe('auto')

        const kowloon = container.querySelector('[data-testid="country-part-option-0"]')
        click(kowloon)

        expect(store.getState().marker.filtercountry.countryPart).toEqual({
            type: 'part',
            name: 'Kowloon',
        })
        expect(partMenu.style.pointerEvents).toBe('none')

        unmount()
    })

    test('supports keyboard focus and trigger activation', () => {
        const { container, unmount } = renderCountrySelect()

        const codeTrigger = container.querySelector('[data-testid="country-code-trigger"]')
        const codeMenu = container.querySelector('[data-testid="country-code-menu"]')

        codeTrigger.focus()
        expect(document.activeElement).toBe(codeTrigger)

        click(codeTrigger)
        expect(codeMenu.style.pointerEvents).toBe('auto')

        unmount()
    })
})
