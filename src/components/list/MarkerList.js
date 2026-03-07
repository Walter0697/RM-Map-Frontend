import React, { useMemo, useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'

import WrapperBox from '../wrapper/WrapperBox'
import MarkerItem from './listitem/MarkerItem'

function MarkerList({
  top,
  height,
  markers,
  setSelectedById,
  eventtypes,
  onReachEnd,
  hasMore,
  loadingMore,
  loadingError,
  onRetry,
  staleData,
  offlineCached,
  onRefreshTop,
  refreshing,
}) {
    const refreshArmedRef = useRef(false)
    const [ scrollerEl, setScrollerEl ] = useState(null)
    const [ refreshUI, setRefreshUI ] = useState('hidden')

    const footerContent = useMemo(() => {
      if (loadingMore) return <div style={{ paddingBottom: '16px' }}>Loading more markers...</div>
      if (loadingError) {
        return (
          <div style={{ paddingBottom: '16px' }}>
            Failed to load more markers.
            {onRetry && (
              <button type='button' onClick={onRetry} style={{ marginLeft: '8px' }}>
                Retry
              </button>
            )}
          </div>
        )
      }
      if (offlineCached) return <div style={{ paddingBottom: '16px' }}>Offline: showing cached list data.</div>
      if (staleData) return <div style={{ paddingBottom: '16px' }}>Showing cached marker data.</div>
      return null
    }, [loadingMore, loadingError, onRetry, staleData, offlineCached])

    useEffect(() => {
      if (!scrollerEl) return
      const onScroll = () => {
        const top = scrollerEl.scrollTop || 0
            if (top > 80 && !refreshArmedRef.current) {
              refreshArmedRef.current = true
            }
        if (top <= 2 && refreshArmedRef.current && onRefreshTop && !loadingMore) {
          refreshArmedRef.current = false
          setRefreshUI('refreshing')
          onRefreshTop()
        }
      }
      scrollerEl.addEventListener('scroll', onScroll, { passive: true })
      return () => scrollerEl.removeEventListener('scroll', onScroll)
    }, [scrollerEl, onRefreshTop, loadingMore, refreshing])

    useEffect(() => {
      if (refreshing) {
        setRefreshUI('refreshing')
        return
      }
      if (refreshUI === 'refreshing') {
        const timer = window.setTimeout(() => {
          setRefreshUI('hidden')
        }, 350)
        return () => window.clearTimeout(timer)
      }
    }, [refreshing, refreshUI])

    return (
      <div
        style={{
          position: 'absolute',
          top: top ?? null,
          height: height,
          width: '95%',
          paddingLeft: '5%',
          paddingTop: '20px',
        }}
      >
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: refreshUI === 'refreshing' ? 'translate(-50%, 0)' : 'translate(-50%, -120%)',
              opacity: refreshUI === 'refreshing' ? 1 : 0,
              transition: 'all 220ms ease',
              background: '#4ea6d8',
              color: '#fff',
              borderRadius: '999px',
              fontSize: '12px',
            fontWeight: 600,
            padding: '6px 12px',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              pointerEvents: 'none',
            }}
          >
          Refreshing list...
        </div>
        <Virtuoso
          style={{ height: '100%', width: '100%' }}
          data={markers}
          scrollerRef={setScrollerEl}
          endReached={() => {
            if (!hasMore || loadingMore || !onReachEnd) return
            onReachEnd()
          }}
          components={{
            Footer: () => footerContent,
          }}
          itemContent={(_, item) => {
            const currentType = eventtypes.find(s => s.value === item.type)
            const typeIcon = currentType?.icon_path || ''
            return (
              <WrapperBox
                key={item.id}
                height={'120px'}
                marginBottom='10px'
              >
                <MarkerItem
                  item={item}
                  typeIcon={typeIcon}
                  onClickHandler={() => setSelectedById(item.id)}
                />
              </WrapperBox>
            )
          }}
        />
      </div>
    )
}

export default connect(state => ({
  eventtypes: state.marker.eventtypes,
}))(MarkerList)
