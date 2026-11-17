export function sortMarkersLatestFirst(markers = []) {
    return [...markers].sort((a, b) => {
        if ((a?.id || 0) < (b?.id || 0)) return 1
        if ((a?.id || 0) > (b?.id || 0)) return -1
        return 0
    })
}
