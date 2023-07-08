import React from 'react'
import {
    Grid,
} from '@mui/material'

import BaseForm from '../BaseForm'

import constants from '../../../constant'
import storage from '../../../scripts/storage'

function CountryMapSelect({
    open,
    handleClose,
    mapName,
    setMapName,
}) {
    const onSelectionClickHandler = (name) => {
        if (mapName === name) {
            return
        }

        storage.changeCurrentMap('country', name)
        setMapName(name)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title="Select Map"
            handleSubmit={null}
        >
            <Grid container spacing={2}>
                {constants.country.countryList.map((countryMap, index) => (
                    <Grid item xs={12} key={`mapselect-${index}`}>
                        <Grid container sx={{ 
                                border: `3px solid ${mapName === countryMap.label ? 'blue' : '#ffffff'}`,
                                borderRadius: '5px',
                                padding: '10px',
                                background: '#9ff4ffcc',
                                cursor: 'pointer',
                            }}
                            onClick={() => onSelectionClickHandler(countryMap.label)}
                        >
                            <Grid item xs={4} sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <img
                                    src={countryMap.image}
                                    height={'50px'}
                                />
                            </Grid>
                            <Grid item xs={8} sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '20px',
                            }}>
                                {countryMap.label}
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </BaseForm>
    )
}

export default CountryMapSelect