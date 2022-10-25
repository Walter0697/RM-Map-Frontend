import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    Button,
    TextField,
} from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CloseIcon from '@mui/icons-material/Close'

import BaseForm from '../BaseForm'
import FilterBorder from '../../filter/FilterBorder'

import sorts from '../../../scripts/search/sort'
const sortable_list = sorts.getSortableList()

function SortWordBlock({
    setSortWord,
    name,
    value
}) {
    return (
        <div
            style={{
                marginRight: '10px',
                backgroundColor: '#33333311',
                height: '40px',
                paddingLeft: '10px',
                paddingRight: '10px',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
            }}
            onClick={() => setSortWord(value)}
        >{name}</div>
    )
}

function SortEdit({
    open,
    handleClose,
    selectedSortList,
    onConfirm,
}) {
    const [ sortList, setSortList ] = useState([])
    const [ currentSelectSort, setCurrentSelectSort ] = useState({
        sortType: '',
        sortOrder: 'ASC',
    })

    useEffect(() => {
        setSortList(selectedSortList)
    }, [open, selectedSortList])

    const displaySortList = useMemo(() => {
        if (!sortList) return []
        return sortList.map((s) => {
            return sorts.getDescriptionBySortObject(s)
        })
    }, [sortList])

    const onSortKeywordSelected = (keyword) => {
        const current = Object.assign({}, currentSelectSort)
        current.sortType = keyword
        setCurrentSelectSort(() => current)
    }

    const onSortOrderClick = () => {
        if (currentSelectSort.sortType) {
            const current = Object.assign({}, currentSelectSort)
            if (current.sortOrder === 'ASC') {
                current.sortOrder = 'DSC'
            } else {
                current.sortOrder = 'ASC'
            }
            setCurrentSelectSort(() => current)
        }
    }

    const onAddHandler = () => {
        if (currentSelectSort.sortType) {
            const current = Object.assign([], sortList)
            const existing = sortList.find(s => s.sortType === currentSelectSort.sortType)
            if (!existing) {
                current.push(currentSelectSort)
                setSortList(current)
                setCurrentSelectSort({
                    sortType: '',
                    sortOrder: 'ASC',
                })
            }
            
        }
    }

    const removeSortingByIndex = (index) => {
        let current = Object.assign([], sortList)
        current.splice(index, 1)
        setSortList(current)
    }

    const onConfirmHandler = () => {
        onConfirm(sortList)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Sort Edit'}
            maxWidth={'lg'}
            handleSubmit={onConfirmHandler}
            cancelText={'Cancel'}
            createText={'Confirm'}
            loading={false}
        >
            <div style={{
                height: 'auto',
                width: '95%',
                display: 'flex',
                marginLeft: '2.5%',
                marginRight: '2.5%',
                marginTop: '10px',
                overflowX: 'hidden',
                flexWrap: 'wrap',
            }}>
                {displaySortList.map((sort, index) => (
                    <div 
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#a4ffc4',
                            marginBottom: '3px',
                            paddingLeft: '8px',
                            borderRadius: '3px',
                        }}
                        key={'index' + index}
                    >
                        {sort}
                        <span
                            style={{
                                position: 'absolute',
                                right: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                            }}
                            onClick={() => removeSortingByIndex(index)}
                        >
                            <CloseIcon />
                        </span>
                    </div>
                ))}
            </div>
            <FilterBorder />
            <Grid container spacing={1} style={{
                marginBottom: '10px',
            }}>
                <Grid item xs={6}>
                    <div style={{
                        height: '40px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '10px',
                        backgroundColor: '#33333311',
                        borderRadius: '15px',
                        fontSize: '12px',
                    }}>
                        {currentSelectSort?.sortType ? sorts.getWordByKey(currentSelectSort.sortType) : '<Select from Below>'}
                    </div>
                </Grid>
                <Grid item xs={3}>
                    <Button 
                        style={{
                            height: '40px',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '10px',
                            backgroundColor: '#c7e0f8',
                            borderRadius: '15px',
                            textTransform: 'none',
                        }}
                        onClick={onSortOrderClick}
                    >
                        {currentSelectSort?.sortType ? (currentSelectSort.sortOrder === 'ASC' ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )) : '-'}
                    </Button>
                </Grid>
                <Grid item xs={3}>
                    <Button 
                        
                        style={{
                            height: '40px',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '10px',
                            backgroundColor: '#c7e0f8',
                            borderRadius: '15px',
                        }}
                        onClick={onAddHandler}
                    >
                        add
                    </Button>
                </Grid>
            </Grid>
            <FilterBorder />
            <div style={{
                height: '100px',
                width: '95%',
                display: 'flex',
                marginLeft: '2.5%',
                marginRight: '2.5%',
                marginTop: '10px',
                overflowY: 'auto',
                overflowX: 'hidden',
                flexWrap: 'wrap',
            }}>
                {sortable_list.map((keyword, index) => (
                    <SortWordBlock
                        key={`${index}`}
                        setSortWord={onSortKeywordSelected}
                        name={keyword.name}
                        value={keyword.key}
                    />
                ))}
            </div>
        </BaseForm>
    )
}

export default SortEdit