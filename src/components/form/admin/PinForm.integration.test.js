import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

import PinForm from './PinForm'
import { useMutation } from '@apollo/client'
import graphql from '../../../graphql'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

jest.mock('@apollo/client', () => {
    const actual = jest.requireActual('@apollo/client')
    return {
        ...actual,
        useMutation: jest.fn(),
    }
})

jest.mock('./PinPlacementCanvas', () => function MockPinPlacementCanvas() {
    return <div data-testid='mock-pin-placement-canvas' />
})

const baseTypeList = [
    { id: 1, label: 'Food', icon_path: '/icons/food.png' },
]

let createMutationMock = jest.fn()
let editMutationMock = jest.fn()

const getInputByLabelText = (text) => {
    const label = Array.from(document.querySelectorAll('label')).find((item) => item.textContent?.includes(text))
    if (!label) return null
    const inputId = label.getAttribute('for')
    if (!inputId) return null
    return document.getElementById(inputId)
}

const setNativeInputValue = (input, value) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) {
        setter.call(input, value)
    } else {
        input.value = value
    }
}

describe('PinForm save integration', () => {
    let container
    let root
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL

    beforeEach(() => {
        URL.createObjectURL = jest.fn(() => 'blob:mock-pin-image')
        URL.revokeObjectURL = jest.fn()
        container = document.createElement('div')
        document.body.appendChild(container)
        root = createRoot(container)
        useMutation.mockReset()
        createMutationMock = jest.fn()
        editMutationMock = jest.fn()
        useMutation.mockImplementation((query) => {
            if (query === graphql.pins.create) {
                return [createMutationMock, { data: null, loading: false, error: null }]
            }
            if (query === graphql.pins.edit) {
                return [editMutationMock, { data: null, loading: false, error: null }]
            }
            return [jest.fn(), { data: null, loading: false, error: null }]
        })
    })

    afterEach(() => {
        act(() => {
            root.unmount()
        })
        container.remove()
        URL.createObjectURL = originalCreateObjectURL
        URL.revokeObjectURL = originalRevokeObjectURL
    })

    test('create flow calls create mutation with form payload', async () => {
        await act(async () => {
            root.render(
                <MemoryRouter>
                    <PinForm
                        open
                        handleClose={() => {}}
                        onCreated={() => {}}
                        onUpdated={() => {}}
                        typeList={baseTypeList}
                        pin={null}
                    />
                </MemoryRouter>
            )
        })

        const labelInput = getInputByLabelText('label') || document.querySelector('input')
        await act(async () => {
            setNativeInputValue(labelInput, 'New Pin')
            labelInput.dispatchEvent(new Event('input', { bubbles: true }))
            labelInput.dispatchEvent(new Event('change', { bubbles: true }))
        })

        const uploadFile = new File(['pin-image'], 'pin.png', { type: 'image/png' })
        const uploadInput = document.getElementById('upload-image')
        await act(async () => {
            Object.defineProperty(uploadInput, 'files', {
                configurable: true,
                value: [uploadFile],
            })
            uploadInput.dispatchEvent(new Event('change', { bubbles: true }))
        })

        const createButton = Array.from(document.querySelectorAll('button')).find((item) => item.textContent?.includes('Create'))
        await act(async () => {
            createButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })

        expect(createMutationMock).toHaveBeenCalledWith({
            variables: {
                label: 'New Pin',
                top_left_x: 0,
                top_left_y: 0,
                bottom_right_x: 0,
                bottom_right_y: 0,
                image_upload: uploadFile,
                group_ids: [],
            },
        })
    })

    test('edit flow calls edit mutation with existing geometry', async () => {
        const pin = {
            id: 5,
            label: 'Old Pin',
            image_path: '/pins/old.png',
            top_left_x: 10,
            top_left_y: 10,
            bottom_right_x: 50,
            bottom_right_y: 50,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
            created_by: { username: 'admin' },
            updated_by: { username: 'admin' },
        }

        await act(async () => {
            root.render(
                <MemoryRouter>
                    <PinForm
                        open
                        handleClose={() => {}}
                        onCreated={() => {}}
                        onUpdated={() => {}}
                        typeList={baseTypeList}
                        pin={pin}
                    />
                </MemoryRouter>
            )
        })

        const updateButton = Array.from(document.querySelectorAll('button')).find((item) => item.textContent?.includes('Update'))
        await act(async () => {
            updateButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })

        expect(editMutationMock).toHaveBeenCalledWith({
            variables: {
                id: 5,
                label: 'Old Pin',
                top_left_x: 10,
                top_left_y: 10,
                bottom_right_x: 50,
                bottom_right_y: 50,
                image_upload: null,
                group_ids: [],
            },
        })
    })
})
