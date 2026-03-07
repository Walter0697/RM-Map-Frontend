export const WEATHER_TRANSITION_DURATION_MS = 600

export const shouldAnimateWeatherTransition = (previousViewport, nextViewport) => {
    if (!previousViewport || !nextViewport) return false
    const zoomDiff = Math.abs((previousViewport.zoom || 0) - (nextViewport.zoom || 0))
    const centerLatBefore = ((previousViewport.max_lat || 0) + (previousViewport.min_lat || 0)) / 2
    const centerLonBefore = ((previousViewport.max_lon || 0) + (previousViewport.min_lon || 0)) / 2
    const centerLatAfter = ((nextViewport.max_lat || 0) + (nextViewport.min_lat || 0)) / 2
    const centerLonAfter = ((nextViewport.max_lon || 0) + (nextViewport.min_lon || 0)) / 2
    const latMove = Math.abs(centerLatAfter - centerLatBefore)
    const lonMove = Math.abs(centerLonAfter - centerLonBefore)
    return zoomDiff >= 0.35 || latMove >= 0.03 || lonMove >= 0.03
}

export const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false
    if (!window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
