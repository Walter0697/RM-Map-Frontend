const clampLongitude = (value) => Math.max(-180, Math.min(180, value))
const clampLatitude = (value) => Math.max(-90, Math.min(90, value))

export const buildViewportQuery = (bounds, zoom) => {
    if (!bounds) return null
    const west = clampLongitude(bounds.getWest())
    const east = clampLongitude(bounds.getEast())
    const south = clampLatitude(Math.min(bounds.getSouth(), bounds.getNorth()))
    const north = clampLatitude(Math.max(bounds.getSouth(), bounds.getNorth()))
    const output = {
        west,
        south,
        east,
        north,
    }
    if (typeof zoom === 'number' && Number.isFinite(zoom)) {
        output.zoom = Math.round(zoom)
    }
    return output
}

export default {
    buildViewportQuery,
}
