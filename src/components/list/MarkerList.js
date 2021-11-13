import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  useSpring,
  config,
  animated,
} from '@react-spring/web'
import {
    Grid,
    Button,
} from '@mui/material'

import StarIcon from '@mui/icons-material/Star'

import BottomUpTrail from '../animatein/BottomUpTrail'
import ImageHeadText from '../wrapper/ImageHeadText'
import FilterBox from '../filterbox/FilterBox'

function ButtonBox({
    height,
    children,
  }) {
  return (
    <div style={{
      height,
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

function MarkerItem({
  item,
  typeIcon,
  onClickHandler,
}) {
  const [ imageExist, setImageExist ] = useState(false)
  
  useEffect(() => {
    if (item?.image_link) {
      setImageExist(true)
    } else {
      setImageExist(false)
    }
  }, [item])

  const onImageFailedToLoad = () => {
    setImageExist(false)
  }

  return (
    <Button
      variant='contained'
      size='large'
      style={{
        position: 'relative',
        backgroundColor: '#48acdb',
        borderRaduis: '5px',
        height: '100%',
        width: '100%',
        boxShadow: '2px 2px 6px',
        alignItems: 'flex-start',
        textTransform: 'none',
        padding: '0',
      }}
      onClick={onClickHandler}
    >
      <Grid
        container
        fullWidth
      >
        { imageExist ? (
          <Grid 
            item xs={5}
            style={{ marginTop: '15px' }}
          >
            <img
              height='90px'
              src={process.env.REACT_APP_IMAGE_LINK + item.image_link}
              onError={onImageFailedToLoad}
            />
          </Grid>
        ) : (
          <Grid 
            item xs={5}
            style={{ marginTop: '15px' }}
          >
            {/* <img
              height='90px'
              src={process.env.REACT_APP_IMAGE_LINK + item.image_link}
              onError={onImageFailedToLoad}
            /> */}
            {/* make a temp image */}
          </Grid>
        )}
        <Grid 
          item 
          xs={7}
          style={{
            marginTop: '15px',
          }}
        >
          <Grid container fullWidth>
            <Grid 
              item xs={12} md={12} lg={12} fullWidth
              style={{
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              <ImageHeadText
                iconPath={process.env.REACT_APP_IMAGE_LINK + typeIcon}
                iconSize='20px'
                label={item.label}
                labelSize='20px'
                labelColor='black'
              />
            </Grid>
            <Grid item xs={12} md={12} lg={12} fullWidth>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#455295',
                }}
              >
                {item.address}
              </div>
            </Grid>
            <Grid item xs={12} md={12} lg={12} fullWidth>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '5px',
                  color: '#071c8d',
                }}
              >
                {item.description}
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {item.is_fav && (
         <div
            style={{ 
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
          >
          <StarIcon sx={{ color: 'yellow' }}/>
        </div>
      )}
     
    </Button>
  )
}

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
  filterOpen,
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
                  height: height,
                  width: '95%',
                  paddingLeft: '5%',
                  paddingTop: '20px',
                  overflow: 'auto',
              }}
          >
              <BottomUpTrail>
                {markers.map((item, index) => (
                  <ButtonBox
                    key={index}
                    height='120px'
                  >
                    <MarkerItem
                      item={item}
                      typeIcon={eventtypes.find(s => s.value === item.type).icon_path}
                      onClickHandler={() => setSelectedById(item.id)}
                    />
                  </ButtonBox>
                ))}
              </BottomUpTrail>
          </div>

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
            />
          </animated.div>
        </>
    )
}

export default connect(state => ({
  eventtypes: state.marker.eventtypes,
}))(MarkerList)