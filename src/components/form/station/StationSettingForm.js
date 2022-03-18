import React from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    Switch,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Slide,
    Button,
    FormControlLabel,
} from '@mui/material'

import actions from '../../../store/actions'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function StationSettingForm({
    open,
    handleClose,
    showInMap,
    dispatch,
}) {
    const handleSearchMapChange = (e) => {
        dispatch(actions.setStationMapShown('searchMap', e.target.checked))
    }

    const handleMarkerMapChange = (e) => {
        dispatch(actions.setStationMapShown('markerMap', e.target.checked))
    }

    return (
        <Dialog
            fullWidth
            maxWidth={'lg'}
            open={open}
            onClose={handleClose}
            scroll={'paper'}
            TransitionComponent={TransitionUp}
        >
            <DialogTitle>
                Station Setting
            </DialogTitle>
            <DialogContent diviers>
                <Grid container fullWidth>
                    <Grid item xs={12} md={12} lg={12}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={showInMap.searchMap} 
                                    onChange={handleSearchMapChange} 
                                />
                            }
                            label='Display Station On Search Map'
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={showInMap.markerMap} 
                                    onChange={handleMarkerMapChange} 
                                />
                            }
                            label='Display Station On Marker Map'
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={handleClose}
                >   
                    close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default connect(state => ({
    showInMap: state.station.showInMap,
})) (StationSettingForm)