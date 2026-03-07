const CACHE_VERSION = 'v1'
const MAX_CACHE_ENTRIES = 120

const nowISO = () => new Date().toISOString()

const buildStoragePrefix = (resource) => `rm_paged_cache:${CACHE_VERSION}:${resource}:`

const sortedObject = (input) => {
    if (!input || typeof input !== 'object') return input
    if (Array.isArray(input)) return input.map(sortedObject)
    const output = {}
    Object.keys(input).sort().forEach((key) => {
        output[key] = sortedObject(input[key])
    })
    return output
}

export const buildPagedCacheKey = (resource, queryIdentity, cursor = '') => {
    const normalizedIdentity = JSON.stringify(sortedObject(queryIdentity || {}))
    return `${buildStoragePrefix(resource)}${normalizedIdentity}:cursor=${cursor || ''}`
}

const getAllCacheKeys = (resource) => {
    const keys = []
    const prefix = buildStoragePrefix(resource)
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
            keys.push(key)
        }
    }
    return keys
}

const pruneResourceCache = (resource) => {
    const keys = getAllCacheKeys(resource)
    if (keys.length <= MAX_CACHE_ENTRIES) return

    const entries = keys.map((key) => {
        const raw = localStorage.getItem(key)
        if (!raw) return { key, lastAccessedAt: '' }
        try {
            const parsed = JSON.parse(raw)
            return { key, lastAccessedAt: parsed.lastAccessedAt || parsed.fetchedAt || '' }
        } catch (_) {
            return { key, lastAccessedAt: '' }
        }
    })

    entries.sort((a, b) => String(a.lastAccessedAt).localeCompare(String(b.lastAccessedAt)))
    const removeCount = keys.length - MAX_CACHE_ENTRIES
    for (let i = 0; i < removeCount; i += 1) {
        localStorage.removeItem(entries[i].key)
    }
}

export const writePagedCache = (resource, key, payload) => {
    const record = {
        version: CACHE_VERSION,
        fetchedAt: nowISO(),
        lastAccessedAt: nowISO(),
        ...payload,
    }
    localStorage.setItem(key, JSON.stringify(record))
    pruneResourceCache(resource)
}

export const readPagedCache = (key, ttlMs) => {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        const fetchedAtMs = new Date(parsed.fetchedAt || 0).getTime()
        const stale = !fetchedAtMs || (Date.now() - fetchedAtMs > ttlMs)
        parsed.lastAccessedAt = nowISO()
        localStorage.setItem(key, JSON.stringify(parsed))
        return {
            stale,
            record: parsed,
        }
    } catch (_) {
        localStorage.removeItem(key)
        return null
    }
}

export default {
    buildPagedCacheKey,
    writePagedCache,
    readPagedCache,
}
