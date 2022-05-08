import React, { useState, useRef } from 'react'
import { connect } from 'react-redux'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'
// import FilterBox from '../filterbox/FilterBox'
import AutoUpdateTop from './AutoUpdateTop'
import MarkerItem from './listitem/MarkerItem'

const loadingBoxHeight = 300

function MarkerList({
  height,
  markers,
  setSelectedById,
  eventtypes,
  filterOption,   // below filter related
  filterValue,
  setFilterValue,
  isFilterExpanded,
  setExpandFilter,
  confirmFilterValue,
  finalFilterValue,
  customFilterValue,
  setCustomFilterValue,
  filterOpen,
}) {
    const listRef = useRef(null)
    const itemListRef = useRef(null)

    // const {
    //   filterBoxTransform,
    //   filterBoxOpacity,
    // } = useSpring({
    //   config: config.slow,
    //   from: {
    //     filterBoxOpacity: 0,
    //     filterBoxTransform: 'scale(0, 0) translate(-100%, 3000%)',
    //   },
    //   to: {
    //     filterBoxOpacity: filterOpen ? 1 : 0,
    //     filterBoxTransform: filterOpen ? 'scale(1, 1) translate(0%, 0%)' : 'scale(0, 0) translate(-100%, 3000%)',
    //   }
    // })

    const [ bottomPaddingBox, setPaddingHeight ] = useState(0)

    return (
        <>
          <div 
              ref={listRef}
              style={{
                  position: 'absolute',
                  height: height,
                  width: '95%',
                  paddingLeft: '5%',
                  paddingTop: '20px',
                  overflow: 'auto',
              }}
          >
            <AutoUpdateTop
              topHeight={loadingBoxHeight}
              items={markers}
              listRef={listRef}
              itemListRef={itemListRef}
              setBottomPaddingHeight={setPaddingHeight}
            />
              <div ref={itemListRef}>
                <BottomUpTrail>
                  {markers.map((item, index) => (
                    <WrapperBox
                      key={index}
                      height={'120px'}
                      marginBottom='10px'
                    >
                      <MarkerItem
                        item={item}
                        typeIcon={eventtypes.find(s => s.value === item.type).icon_path}
                        onClickHandler={() => setSelectedById(item.id)}
                      />
                    </WrapperBox>
                  ))}
                </BottomUpTrail>
              </div>

              <div
                style={{
                  height: bottomPaddingBox,
                  width: '100%',
                }}
              />
          </div>

          {/* <animated.div style={{
            transform: filterBoxTransform,
            position: 'absolute',
            paddingTop: '20px',
            paddingLeft: '5%',
            width: '100%',
            transformOrigin: 'bottom left',
            visibility: filterBoxOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
          }}>
            <FilterBox 
                filterOption={filterOption}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
                isExpanded={isFilterExpanded}
                setExpand={setExpandFilter}
                confirmFilterValue={confirmFilterValue}
                finalFilterValue={finalFilterValue}
                customFilterValue={customFilterValue}
                setCustomFilterValue={setCustomFilterValue}
            />
          </animated.div> */}
        </>
    )
}

export default connect(state => ({
  eventtypes: state.marker.eventtypes,
}))(MarkerList)