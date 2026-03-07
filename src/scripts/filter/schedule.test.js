import dayjs from 'dayjs'

import scheduleFilter from './schedule'

describe('schedule filter', () => {
    test('uses local date matching for today schedules', () => {
        const today = dayjs().format('YYYY-MM-DD')
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')

        const schedules = [
            { id: 1, selected_date: `${today}T09:00:00` },
            { id: 2, selected_date: `${tomorrow}T09:00:00` },
        ]

        const todayList = scheduleFilter.get_today(schedules)
        expect(todayList).toHaveLength(1)
        expect(todayList[0].id).toBe(1)
    })

    test('adds image_path without mutating original item', () => {
        const today = dayjs().format('YYYY-MM-DD')
        const source = {
            id: 1,
            selected_date: `${today}T09:00:00`,
            marker: {
                image_link: '/image/sample.png',
                type: 'park',
            },
        }

        const output = scheduleFilter.get_today_image([source], [])
        expect(output).toHaveLength(1)
        expect(output[0].image_path).toBe('/image/sample.png')
        expect(source.image_path).toBeUndefined()
    })

    test('uses marker type icon when marker image is missing', () => {
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
        const source = {
            id: 3,
            selected_date: `${tomorrow}T12:00:00`,
            marker: {
                type: 'museum',
            },
        }

        const eventtypes = [
            { value: 'museum', icon_path: '/image/icons/museum.png' },
        ]

        const output = scheduleFilter.get_schedule_image([source], eventtypes)
        expect(output).toHaveLength(1)
        expect(output[0].image_path).toBe('/image/icons/museum.png')
        expect(source.image_path).toBeUndefined()
    })
})
