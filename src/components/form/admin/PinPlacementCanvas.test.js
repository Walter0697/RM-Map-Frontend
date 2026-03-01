import {
    getDraggedRect,
    getResizedRect,
    toLegacyGeometry,
} from './PinPlacementCanvas'

describe('PinPlacementCanvas interaction math', () => {
    test('desktop drag updates position and keeps size', () => {
        const startRect = { x: 0.1, y: 0.1, width: 0.3, height: 0.3 }
        const nextRect = getDraggedRect(startRect, 0.1, 0.05)

        expect(nextRect.x).toBeCloseTo(0.2)
        expect(nextRect.y).toBeCloseTo(0.15)
        expect(nextRect.width).toBeCloseTo(0.3)
        expect(nextRect.height).toBeCloseTo(0.3)

        const legacy = toLegacyGeometry(nextRect, 100, 100)
        expect(legacy.top_left_x).toBe(20)
        expect(legacy.top_left_y).toBe(15)
        expect(legacy.bottom_right_x).toBe(50)
        expect(legacy.bottom_right_y).toBe(45)
    })

    test('touch corner resize increases bounds with min-size constraints', () => {
        const startRect = { x: 0.1, y: 0.1, width: 0.3, height: 0.3 }
        const nextRect = getResizedRect(startRect, 'se', 0.12, 0.08)

        expect(nextRect.x).toBeCloseTo(0.1)
        expect(nextRect.y).toBeCloseTo(0.1)
        expect(nextRect.width).toBeGreaterThan(0.3)
        expect(nextRect.height).toBeGreaterThan(0.3)

        const legacy = toLegacyGeometry(nextRect, 100, 100)
        expect(legacy.bottom_right_x).toBeGreaterThan(40)
        expect(legacy.bottom_right_y).toBeGreaterThan(40)
    })
})
