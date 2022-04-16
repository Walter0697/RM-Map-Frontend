import React from 'react'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import FilterAltIcon from '@mui/icons-material/FilterAlt'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'
import CircleIconButton from '../field/CircleIconButton'
import FilterBox from '../filterbox/FilterBox'
import MarkerItem from './listitem/MarkerItem'

function MarkerDisplayList({
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
    setShowFilter,
}) {
    const {
        filterBoxTransform,
        filterBoxOpacity,
      } = useSpring({
        config: config.slow,
        from: {
          filterBoxOpacity: 0,
          filterBoxTransform: 'scale(0, 0) translate(-100%, 3000%)',
        },
        to: {
          filterBoxOpacity: filterOpen ? 1 : 0,
          filterBoxTransform: filterOpen ? 'scale(1, 1) translate(0%, 0%)' : 'scale(0, 0) translate(-100%, 3000%)',
        }
      })

    return (
        <>
            <div 
                style={{
                    position: 'absolute',
                    height: '80%',
                    width: '95%',
                    paddingLeft: '5%',
                    paddingTop: '20px',
                    overflow: 'auto',
                }}
            >
                <BottomUpTrail>
                    {markers.map((item, index) => (
                    <WrapperBox
                        key={index}
                        height='120px'
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
            {/* filter related */}
            {/* button to open */}
            <div
                style={{ 
                    position: 'absolute',
                    bottom: '15%',
                    left: '20px',
                }}
            >
                <CircleIconButton
                    onClickHandler={() => setShowFilter(s => !s)}
                >
                    <FilterAltIcon />
                </CircleIconButton>
            </div>
            {/* filter box */}
            <animated.div style={{
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
            </animated.div>
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
  }))(MarkerDisplayList)