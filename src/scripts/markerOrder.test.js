import { sortMarkersLatestFirst } from './markerOrder'

test('sorts visible markers from newest to oldest without mutating input', () => {
    const markers = [{ id: 2 }, { id: 5 }, { id: 3 }]

    expect(sortMarkersLatestFirst(markers).map(marker => marker.id)).toEqual([5, 3, 2])
    expect(markers.map(marker => marker.id)).toEqual([2, 5, 3])
})
