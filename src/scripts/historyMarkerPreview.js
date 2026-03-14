import backend from '../constant/backend'

const PROFILE = 'history-list'
const isEnabled = () => process.env.REACT_APP_HISTORY_MARKER_PREVIEW !== 'false'

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value)

const hasValidCoordinates = (marker) => {
    const lat = marker?.latitude
    const lon = marker?.longitude
    if (!isFiniteNumber(lat) || !isFiniteNumber(lon)) return false
    if (lat === 0 && lon === 0) return false
    if (lat < -90 || lat > 90) return false
    if (lon < -180 || lon > 180) return false
    return true
}

const buildIdlePreviewState = (marker) => {
    if (!hasValidCoordinates(marker)) {
        return {
            profile: PROFILE,
            state: 'fallback',
            fallback_reason: 'no_coordinates',
            cache_hit: false,
        }
    }

    return {
        profile: PROFILE,
        state: 'loading',
        cache_hit: false,
    }
}

const buildRequestURL = (markerID) => backend.withBasePath(`settings/history-marker-preview?marker_id=${encodeURIComponent(markerID)}&profile=${encodeURIComponent(PROFILE)}`)

const fetchPreview = async (markerID, jwt, signal) => {
    const response = await fetch(buildRequestURL(markerID), {
        method: 'GET',
        headers: {
            Authorization: jwt,
        },
        signal,
    })

    if (!response.ok) {
        const raw = await response.text()
        const error = new Error(raw || 'Failed to load history marker preview')
        error.status = response.status
        throw error
    }

    return response.json()
}

const toRenderableImageURL = (payload) => {
    const imageURL = `${payload?.image_url || ''}`.trim()
    if (!imageURL) return ''
    if (/^https?:\/\//i.test(imageURL)) return imageURL
    return `${backend.IMAGE_LINK}${imageURL}`
}

const preview = {
    PROFILE,
    isEnabled,
    hasValidCoordinates,
    buildIdlePreviewState,
    buildRequestURL,
    fetchPreview,
    toRenderableImageURL,
}

export default preview
