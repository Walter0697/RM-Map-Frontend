import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import { 
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CloseIcon from '@mui/icons-material/Close'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh' 

import useBoop from '../../hooks/useBoop'

import CircleIconButton from '../field/CircleIconButton'
import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'
import RoroadListItem from './listitem/RoroadListItem'
import AutoHideAlert from '../AutoHideAlert'

import actions from '../../store/actions'
import graphql from '../../graphql'

function RoroadListList({
    roroadlists,
    username,
    openCreateForm,
    openEditForm,
    openViewForm,
    openFilterForm,
    isPrevious,
    dispatch,
}) {
    const [ manageRoroadListsGQL, { data: manageData, loading: manageLoading, error: manageError } ] = useMutation(graphql.roroadlists.manage_multiple, { errorPolicy: 'all' })

    const [ isHidingItem, setIsHidingItem ] = useState(false)
    const [ hidingItemList, setHidingItemList ] = useState([])

    const [ uploadFail, setUploadFail ] = useBoop(3000)

    const { 
        hiddenButtonOpacity,
        hiddenButtonRight,
        hiddenButtonBottom,
        hiddenButtonColor,
    } = useSpring({
        config: config.wobbly,
        from: {
            hiddenButtonOpacity: 0,
            hiddenButtonRight: '20px',
            hiddenButtonBottom: '5%',
            hiddenButtonColor: 'white',
        },
        to: {
            hiddenButtonOpacity: (isHidingItem) ? 1 : 0,
            hiddenButtonRight: (isHidingItem) ? '80px' : '20px',
            hiddenButtonBottom: (isHidingItem) ? '15%' : '5%',
            hiddenButtonColor: (isHidingItem) ? '#e58282' : 'white'
        }
    })

    const sortedList = useMemo(() => {
        if (!roroadlists) return []
        return roroadlists.sort((a, b) => {
            if (!a || !b) return 0
            if (a.target_user === username && b.target_user !== username) return -1
            if (b.target_user === username && a.target_user !== username) return 1
            if (a.checked && !b.checked) return -1
            if (b.checked && a.checked) return 1
            return 0
        })
    }, [roroadlists, username])

    useEffect(() => {
        if (manageError) {
            setUploadFail()
        }
    }, [manageError])

    const onItemClickHandler = (item) => {
        if (!isHidingItem) {
            if (isPrevious) {
                openViewForm(item)
            } else {
                openEditForm(item)
            }
        } else {
            let current = JSON.parse(JSON.stringify(hidingItemList))
            if (current.includes(item.id)) {
                current = current.filter(s => s !== item.id)
            } else {
                current.push(item.id)
            }

            setHidingItemList(current)
        }
    }

    const onTrashClickHandler = () => {
        if (!isHidingItem) {
            setHidingItemList([])
            setIsHidingItem(true)
        } else {
            if (hidingItemList.length === 0) {
                onTrashCancelHandler()
                return 
            }

            // if it is active, then call alert and send request
            const confirm = window.confirm('Are you sure that you want to hide these items?')
            if (confirm) {
                manageRoroadListsGQL({ variables: {
                    ids: hidingItemList,
                    hidden: true,
                }})

                const list = hidingItemList.map(s => {
                    return {
                        id: s,
                        hidden: true,
                    }
                })
                dispatch(actions.manageMultipleRoroadLists(list))
                setHidingItemList([])
                setIsHidingItem(false)
            }
            
        }
    }

    const onAutoSelectHandler = () => {
        const selectedSet = new Set()
        for (let i = 0; i < hidingItemList.length; i++) {
            selectedSet.add(hidingItemList[i])
        }

        for (let i = 0; i < roroadlists.length; i++) {
            if (roroadlists[i].checked) {
                selectedSet.add(roroadlists[i].id)
            }
        }

        setHidingItemList([...selectedSet])
    }

    const onTrashCancelHandler = () => {
        setIsHidingItem(false)
        setHidingItemList([])
    }
    
    return (
        <>
            <div 
                style={{
                    position: 'absolute',
                    height: '90%',
                    width: '95%',
                    paddingLeft: '5%',
                    paddingTop: '20px',
                    overflow: 'auto',
                }}
            >
                <BottomUpTrail>
                    {sortedList.map((item, index) => (
                        <WrapperBox
                            key={index}
                            height={'50px'}
                            marginBottom='10px'
                        >
                            <RoroadListItem 
                                item={item}
                                onClickHandler={() => onItemClickHandler(item)}
                                onUpdateFailHandler={setUploadFail}
                                selectedItems={hidingItemList}
                            />
                        </WrapperBox>
                    ))}
                </BottomUpTrail>
            </div>

            {/* circle button */}
            {openCreateForm && (
                <div
                    style={{ 
                        position: 'absolute',
                        bottom: '5%',
                        left: '20px',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={openCreateForm}
                    >
                        <AddCircleIcon />
                    </CircleIconButton>
                </div>
            )}
            {!isPrevious && (
                <animated.div
                    style={{ 
                        position: 'absolute',
                        bottom: '5%',
                        right: '20px',
                        background: hiddenButtonColor,
                        borderRadius: '100%',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={onTrashClickHandler}
                        background={'inherit'}
                        badgeNumber={hidingItemList.length !== 0 ? hidingItemList.length : null}
                    >
                        {isHidingItem ? <DeleteForeverIcon /> : <DeleteIcon />}
                    </CircleIconButton>
                </animated.div>
            )}
            <animated.div
                style={{ 
                    position: 'absolute',
                    right: '20px',
                    visibility: hiddenButtonOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: hiddenButtonOpacity,
                    bottom: hiddenButtonBottom,
                }}
            >
                <CircleIconButton
                    onClickHandler={onTrashCancelHandler}
                >
                    <CloseIcon />
                </CircleIconButton>
            </animated.div>
            <animated.div
                    style={{ 
                        position: 'absolute',
                        bottom: '5%',
                        visibility: hiddenButtonOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                        opacity: hiddenButtonOpacity,
                        right: hiddenButtonRight,
                    }}
                >
                    <CircleIconButton
                        onClickHandler={onAutoSelectHandler}
                    >
                        <AutoFixHighIcon />
                    </CircleIconButton>
                </animated.div>
            {openFilterForm && (
                <div
                style={{ 
                    position: 'absolute',
                    bottom: '5%',
                    right: '20px',
                }}
            >
                <CircleIconButton
                    onClickHandler={openFilterForm}
                >
                    <FilterAltIcon />
                </CircleIconButton>
            </div>
            )}

            {/* alert */}
            <AutoHideAlert 
                open={uploadFail}
                type={'error'}
                message={'Fail to upload to server'}
                timing={3000}
            />
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
    username: state.auth.username,
})) (RoroadListList)