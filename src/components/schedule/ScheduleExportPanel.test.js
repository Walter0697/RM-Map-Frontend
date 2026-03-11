import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import ScheduleExportPanel from './ScheduleExportPanel'

describe('ScheduleExportPanel', () => {
    const originalFetch = global.fetch
    const originalCreateObjectURL = window.URL.createObjectURL
    const originalRevokeObjectURL = window.URL.revokeObjectURL
    const originalShare = navigator.share
    const originalCanShare = navigator.canShare
    const originalOfflineExportEnabled = process.env.REACT_APP_OFFLINE_EXPORT_ENABLED
    const originalOfflineExportFormats = process.env.REACT_APP_OFFLINE_EXPORT_FORMATS

    beforeEach(() => {
        jest.useFakeTimers()
        process.env.REACT_APP_OFFLINE_EXPORT_ENABLED = 'true'
        process.env.REACT_APP_OFFLINE_EXPORT_FORMATS = 'text,image,notion'
        global.fetch = jest.fn()
        window.URL.createObjectURL = jest.fn(() => 'blob:test')
        window.URL.revokeObjectURL = jest.fn()
        navigator.share = jest.fn(() => Promise.resolve())
        navigator.canShare = jest.fn(() => true)
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
        global.fetch = originalFetch
        window.URL.createObjectURL = originalCreateObjectURL
        window.URL.revokeObjectURL = originalRevokeObjectURL
        navigator.share = originalShare
        navigator.canShare = originalCanShare
        process.env.REACT_APP_OFFLINE_EXPORT_ENABLED = originalOfflineExportEnabled
        process.env.REACT_APP_OFFLINE_EXPORT_FORMATS = originalOfflineExportFormats
        jest.restoreAllMocks()
    })

    const renderPanel = (props = {}) => {
        const now = new Date()
        const year = now.getUTCFullYear()
        const month = `${now.getUTCMonth() + 1}`.padStart(2, '0')
        const day = `${now.getUTCDate()}`.padStart(2, '0')
        const scheduleDate = `${year}-${month}-${day}T10:00:00Z`
        const store = createStore((state = {
            marker: {
                eventtypes: [],
            },
        }) => state)

        return render(
            <Provider store={store}>
                <ScheduleExportPanel
                    jwt='jwt-token'
                    schedules={[
                        {
                            id: 10,
                            label: 'Museum stop',
                            selected_date: scheduleDate,
                            marker: {
                                label: 'City Museum',
                            },
                        },
                    ]}
                    {...props}
                />
            </Provider>
        )
    }

    test('hides export panel when feature is disabled', () => {
        process.env.REACT_APP_OFFLINE_EXPORT_ENABLED = 'false'

        renderPanel()

        expect(screen.queryByLabelText('Open export')).not.toBeInTheDocument()
    })

    test('creates export and polls to partial-success state', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    job: {
                        job_id: 'export_100',
                        status: 'queued',
                        created_at: '2026-03-10T00:00:00Z',
                        updated_at: '2026-03-10T00:00:00Z',
                        snapshot: {
                            generated_at: '2026-03-10T00:00:00Z',
                            timezone: 'UTC',
                        },
                        artifacts: [
                            { format: 'text', status: 'queued', download_url: '/exports/export_100/artifacts/text' },
                            { format: 'image', status: 'queued', download_url: '/exports/export_100/artifacts/image' },
                        ],
                    },
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    job: {
                        job_id: 'export_100',
                        status: 'partial_success',
                        created_at: '2026-03-10T00:00:00Z',
                        updated_at: '2026-03-10T00:00:05Z',
                        snapshot: {
                            generated_at: '2026-03-10T00:00:00Z',
                            timezone: 'UTC',
                        },
                        artifacts: [
                            { format: 'text', status: 'succeeded', download_url: '/exports/export_100/artifacts/text' },
                            { format: 'image', status: 'failed', download_url: '/exports/export_100/artifacts/image' },
                        ],
                    },
                }),
            })

        renderPanel()

        fireEvent.click(screen.getByLabelText('Open export'))
        fireEvent.click(screen.getByText('Create Export'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/exports'), expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: 'jwt-token',
                }),
            }))
            expect(screen.getByText(/Job/)).toBeInTheDocument()
        })

        await act(async () => {
            jest.advanceTimersByTime(2100)
            await Promise.resolve()
        })

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2)
            expect(screen.getByText('partial_success')).toBeInTheDocument()
            expect(screen.getByText('succeeded')).toBeInTheDocument()
            expect(screen.getByText('ready')).toBeInTheDocument()
        })
    })

    test('downloads and shares successful artifact', async () => {
        const blob = new Blob(['artifact body'], { type: 'text/plain' })
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    job: {
                        job_id: 'export_101',
                        status: 'succeeded',
                        created_at: '2026-03-10T00:00:00Z',
                        updated_at: '2026-03-10T00:00:05Z',
                        snapshot: {
                            generated_at: '2026-03-10T00:00:00Z',
                            timezone: 'UTC',
                        },
                        artifacts: [
                            { format: 'text', status: 'succeeded', download_url: '/exports/export_101/artifacts/text' },
                        ],
                    },
                }),
            })
            .mockResolvedValue({
                ok: true,
                blob: async () => blob,
                headers: {
                    get: () => 'attachment; filename="export_101.txt"',
                },
            })

        const appendSpy = jest.spyOn(document.body, 'appendChild')

        renderPanel()

        fireEvent.click(screen.getByLabelText('Open export'))
        fireEvent.click(screen.getByText('Create Export'))

        await waitFor(() => {
            expect(screen.getByText(/Job/)).toBeInTheDocument()
            expect(screen.getByText('Download')).toBeInTheDocument()
            expect(screen.getByText('Preview')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Download'))

        await waitFor(() => {
            expect(window.URL.createObjectURL).toHaveBeenCalled()
            expect(appendSpy).toHaveBeenCalled()
        })

        fireEvent.click(screen.getByText('Share'))

        await waitFor(() => {
            expect(navigator.share).toHaveBeenCalled()
        })
    })

    test('creates local image preview without backend request when only image is selected', async () => {
        renderPanel()

        fireEvent.click(screen.getByLabelText('Open export'))
        fireEvent.click(screen.getByLabelText('Text'))
        fireEvent.click(screen.getByLabelText('Notion'))
        fireEvent.click(screen.getByText('Create Export'))

        await waitFor(() => {
            expect(global.fetch).not.toHaveBeenCalled()
            expect(screen.getByText('Local image preview ready')).toBeInTheDocument()
            expect(screen.getByText('Preview')).toBeInTheDocument()
        })
    })
})
