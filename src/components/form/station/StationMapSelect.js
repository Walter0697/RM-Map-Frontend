import React from 'react'
import Grid from '@mui/material/GridLegacy'

import BaseForm from '../BaseForm'

import constants from '../../../constant'
import storage from '../../../scripts/storage'

function StationMapSelect({
    open,
    handleClose,
    mapName,
    setMapName,
}) {
    const onSelectionClickHandler = (name) => {
        if (mapName === name) {
            return
        }

        storage.changeCurrentMap('station', name)
        setMapName(name)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title="Select Map"
            maxWidth='sm'
            handleSubmit={null}
        >
            <Grid container spacing={2}>
                {constants.country.stationList.map((stationMap, index) => (
                    <Grid item xs={12} key={`mapselect-${index}`}>
                        <Grid container sx={{ 
                                border: `3px solid ${mapName === stationMap.identifier ? 'blue' : '#ffffff'}`,
                                borderRadius: '5px',
                                padding: '10px',
                                background: '#9ff4ffcc',
                                cursor: 'pointer',
                                minHeight: '72px',
                            }}
                            onClick={() => onSelectionClickHandler(stationMap.identifier)}
                        >
                            <Grid item xs={4} sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <img
                                    src={stationMap.image}
                                    style={{
                                        maxHeight: '50px',
                                        width: 'auto',
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            </Grid>
                            <Grid item xs={8} sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '20px',
                            }}>
                                {stationMap.label}
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </BaseForm>
    )
}

export default StationMapSelect
