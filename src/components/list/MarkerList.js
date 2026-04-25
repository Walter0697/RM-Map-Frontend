import React, { useMemo, useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import ViewModuleIcon from '@mui/icons-material/ViewModule'

import CircleIconButton from '../field/CircleIconButton'
import WrapperBox from '../wrapper/WrapperBox'
import MarkerItem from './listitem/MarkerItem'
import HistoryMarkerItem from './listitem/HistoryMarkerItem'
import MarkerGridItem from './listitem/MarkerGridItem'

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
    const loadMoreArmedRef = useRef(false)
    const [ scrollerEl, setScrollerEl ] = useState(null)
    const [ refreshUI, setRefreshUI ] = useState('hidden')
    const [ viewMode, setViewMode ] = useState('list')

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
        const clientHeight = scrollerEl.clientHeight || 0
        const scrollHeight = scrollerEl.scrollHeight || 0
        if (top > 80 && !refreshArmedRef.current) {
          refreshArmedRef.current = true
        }
        if (top <= 2 && refreshArmedRef.current && onRefreshTop && !loadingMore) {
          refreshArmedRef.current = false
          setRefreshUI('refreshing')
          onRefreshTop()
        }
        const nearBottom = top + clientHeight >= scrollHeight - 240
        if (nearBottom && hasMore && !loadingMore && onReachEnd && !loadMoreArmedRef.current) {
          loadMoreArmedRef.current = true
          onReachEnd()
        }
        if (!nearBottom) {
          loadMoreArmedRef.current = false
        }
      }
      scrollerEl.addEventListener('scroll', onScroll, { passive: true })
      return () => scrollerEl.removeEventListener('scroll', onScroll)
    }, [scrollerEl, onRefreshTop, loadingMore, refreshing, hasMore, onReachEnd])

    useEffect(() => {
      if (!loadingMore) {
        loadMoreArmedRef.current = false
      }
    }, [loadingMore])

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

    const viewToggle = (
      <div
        style={{
          position: 'absolute',
          top: '2px',
          right: '0',
          display: 'flex',
          gap: '8px',
          zIndex: 4,
        }}
      >
        <CircleIconButton
          ariaLabel='Switch to list view'
          onClickHandler={() => setViewMode('list')}
          background={viewMode === 'list' ? '#dceeff' : 'white'}
        >
          <ViewAgendaIcon />
        </CircleIconButton>
        <CircleIconButton
          ariaLabel='Switch to grid view'
          onClickHandler={() => setViewMode('grid')}
          background={viewMode === 'grid' ? '#dceeff' : 'white'}
        >
          <ViewModuleIcon />
        </CircleIconButton>
      </div>
    )

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
        {viewToggle}
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
        {viewMode === 'list' ? (
          <Virtuoso
            style={{ height: '100%', width: '100%', paddingTop: '44px' }}
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
              const ListItemComponent = item?.history_preview ? HistoryMarkerItem : MarkerItem
              return (
                <WrapperBox
                  key={item.id}
                  height={'120px'}
                  marginBottom='10px'
                >
                  <ListItemComponent
                    item={item}
                    typeIcon={typeIcon}
                    onClickHandler={() => setSelectedById(item.id)}
                  />
                </WrapperBox>
              )
            }}
          />
        ) : (
          <div
            ref={setScrollerEl}
            style={{
              height: '100%',
              width: '100%',
              overflowY: 'auto',
              paddingTop: '44px',
              paddingRight: '8px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                paddingBottom: '16px',
              }}
            >
              {markers.map((item) => {
                const currentType = eventtypes.find(s => s.value === item.type)
                const typeIcon = currentType?.icon_path || ''
                if (item?.history_preview) {
                  return (
                    <div key={item.id} style={{ gridColumn: '1 / -1' }}>
                      <WrapperBox
                        height={'120px'}
                        marginBottom='0'
                      >
                        <HistoryMarkerItem
                          item={item}
                          typeIcon={typeIcon}
                          onClickHandler={() => setSelectedById(item.id)}
                        />
                      </WrapperBox>
                    </div>
                  )
                }

                return (
                  <MarkerGridItem
                    key={item.id}
                    item={item}
                    typeIcon={typeIcon}
                    onClickHandler={() => setSelectedById(item.id)}
                  />
                )
              })}
            </div>
            {footerContent}
          </div>
        )}
      </div>
    )
}

export default connect(state => ({
  eventtypes: state.marker.eventtypes,
}))(MarkerList)
