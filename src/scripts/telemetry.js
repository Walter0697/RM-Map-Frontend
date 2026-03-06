const metricState = {}
const LOG_PREFIX = '[RM-PAGED]'

const isDebugLoggingEnabled = () => {
    if (typeof window === 'undefined') return false
    const forced = window.localStorage?.getItem('rm_debug_paging')
    if (forced === '1') return true
    if (forced === '0') return false
    return process.env.NODE_ENV !== 'production'
}

const ensureMetric = (name) => {
    if (!metricState[name]) {
        metricState[name] = {
            count: 0,
            totalPayloadBytes: 0,
            errors: 0,
            cacheHits: 0,
            cacheMisses: 0,
        }
    }
    return metricState[name]
}

const estimatePayloadBytes = (payload) => {
    if (!payload) return 0
    try {
        return JSON.stringify(payload).length
    } catch (_) {
        return 0
    }
}

export const trackRequestMetric = (name, payload, errored = false) => {
    const metric = ensureMetric(name)
    metric.count += 1
    metric.totalPayloadBytes += estimatePayloadBytes(payload)
    if (errored) metric.errors += 1
}

export const trackCacheMetric = (name, hit) => {
    const metric = ensureMetric(name)
    if (hit) {
        metric.cacheHits += 1
    } else {
        metric.cacheMisses += 1
    }
}

export const getTelemetrySnapshot = () => {
    return JSON.parse(JSON.stringify(metricState))
}

export const debugLog = (scope, message, payload = null) => {
    if (!isDebugLoggingEnabled()) return
    if (payload === null) {
        console.log(`${LOG_PREFIX}[${scope}] ${message}`)
        return
    }
    console.log(`${LOG_PREFIX}[${scope}] ${message}`, payload)
}

export default {
    trackRequestMetric,
    trackCacheMetric,
    getTelemetrySnapshot,
    debugLog,
}
