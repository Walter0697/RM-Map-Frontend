import { useCallback, useMemo, useRef, useState } from 'react'

import { buildPagedCacheKey, writePagedCache, readPagedCache } from '../scripts/pagedCache'
import telemetry from '../scripts/telemetry'

const DEFAULT_TTL_MS = 5 * 60 * 1000

function usePagedDataController({
    resource,
    queryIdentity,
    fetchPage,
    ttlMs = DEFAULT_TTL_MS,
}) {
    const [ items, setItems ] = useState([])
    const [ nextCursor, setNextCursor ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ refreshing, setRefreshing ] = useState(false)
    const [ error, setError ] = useState(null)
    const [ stale, setStale ] = useState(false)
    const [ offlineCached, setOfflineCached ] = useState(false)

    const latestRequestRef = useRef(0)
    const lastFailedCursorRef = useRef('')

    const reset = useCallback(() => {
        setItems([])
        setNextCursor(null)
        setLoading(false)
        setRefreshing(false)
        setError(null)
        setStale(false)
        setOfflineCached(false)
    }, [])

    const loadFromCache = useCallback((cursor = '') => {
        const key = buildPagedCacheKey(resource, queryIdentity, cursor)
        const cached = readPagedCache(key, ttlMs)
        telemetry.trackCacheMetric(resource, !!cached)
        if (!cached || !cached.record) return null
        return {
            stale: cached.stale,
            pageItems: cached.record.items || [],
            cachedNextCursor: cached.record.nextCursor || null,
        }
    }, [resource, queryIdentity, ttlMs])

    const mergeItems = useCallback((previous, incoming) => {
        const dedupe = {}
        const merged = []
        previous.concat(incoming).forEach((item) => {
            const id = item?.id || JSON.stringify(item)
            if (dedupe[id]) return
            dedupe[id] = true
            merged.push(item)
        })
        merged.sort((a, b) => {
            if ((a?.id || 0) < (b?.id || 0)) return -1
            if ((a?.id || 0) > (b?.id || 0)) return 1
            return 0
        })
        return merged
    }, [])

    const execute = useCallback(async (cursor = '', replace = false) => {
        const requestId = Date.now()
        latestRequestRef.current = requestId
        setError(null)
        setLoading(true)
        if (replace) setRefreshing(true)
        telemetry.debugLog(resource, 'request:start', {
            requestId,
            cursor: cursor || null,
            replace,
        })

        const cached = loadFromCache(cursor)
        if (replace && cached && cached.pageItems.length > 0) {
            setItems(cached.pageItems)
            setNextCursor(cached.cachedNextCursor)
            setStale(cached.stale)
            telemetry.debugLog(resource, 'cache:hydrate', {
                requestId,
                stale: cached.stale,
                items: cached.pageItems.length,
                nextCursor: cached.cachedNextCursor,
            })
        }

        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false
        if (isOffline) {
            if (cached && cached.pageItems.length > 0) {
                setItems((prev) => replace ? cached.pageItems : mergeItems(prev, cached.pageItems))
                setNextCursor(cached.cachedNextCursor)
                setStale(true)
                setOfflineCached(true)
                setError(null)
                telemetry.debugLog(resource, 'offline:cache-used', {
                    requestId,
                    cursor: cursor || null,
                    replace,
                    pageItems: cached.pageItems.length,
                    nextCursor: cached.cachedNextCursor,
                })
            } else {
                setOfflineCached(false)
                setError(new Error('offline_no_cache'))
                telemetry.debugLog(resource, 'offline:no-cache', {
                    requestId,
                    cursor: cursor || null,
                    replace,
                })
            }
            setLoading(false)
            setRefreshing(false)
            return
        }

        try {
            const result = await fetchPage(cursor)
            if (latestRequestRef.current !== requestId) {
                telemetry.debugLog(resource, 'request:drop-stale', { requestId })
                return
            }
            telemetry.trackRequestMetric(resource, result, false)
            const pageItems = result?.items || []
            const responseNextCursor = result?.nextCursor || null
            setNextCursor(responseNextCursor)
            setStale(false)
            setOfflineCached(false)
            setItems((prev) => replace ? pageItems : mergeItems(prev, pageItems))
            const key = buildPagedCacheKey(resource, queryIdentity, cursor)
            writePagedCache(resource, key, {
                items: pageItems,
                nextCursor: responseNextCursor,
            })
            telemetry.debugLog(resource, 'request:success', {
                requestId,
                pageItems: pageItems.length,
                nextCursor: responseNextCursor,
            })
            lastFailedCursorRef.current = ''
        } catch (err) {
            if (latestRequestRef.current !== requestId) {
                telemetry.debugLog(resource, 'request:drop-stale-error', { requestId })
                return
            }
            telemetry.trackRequestMetric(resource, null, true)
            lastFailedCursorRef.current = cursor
            setError(err)
            telemetry.debugLog(resource, 'request:error', {
                requestId,
                cursor: cursor || null,
                message: err?.message || 'unknown error',
            })
        } finally {
            if (latestRequestRef.current === requestId) {
                setLoading(false)
                setRefreshing(false)
            }
        }
    }, [fetchPage, mergeItems, loadFromCache, resource, queryIdentity])

    const refresh = useCallback(() => execute('', true), [execute])
    const loadMore = useCallback(() => {
        if (!nextCursor || loading) {
            telemetry.debugLog(resource, 'loadMore:skip', {
                nextCursor,
                loading,
            })
            return
        }
        telemetry.debugLog(resource, 'loadMore:start', { nextCursor })
        execute(nextCursor, false)
    }, [execute, nextCursor, loading, resource])
    const retry = useCallback(() => execute(lastFailedCursorRef.current || '', lastFailedCursorRef.current === ''), [execute])

    return useMemo(() => ({
        items,
        nextCursor,
        loading,
        refreshing,
            stale,
            offlineCached,
            error,
        refresh,
        loadMore,
        retry,
        reset,
    }), [items, nextCursor, loading, refreshing, stale, offlineCached, error, refresh, loadMore, retry, reset])
}

export default usePagedDataController
