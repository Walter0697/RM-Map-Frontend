import React from 'react'

function BottomSearchNameDisplay({
    searchName,
}) {
    return (
        <div style={{
            position: 'absolute',
            bottom: '3.5%',
            width: '75%',
            height: '8.5%',
            boxShadow: '2px 2px 6px',
            backgroundColor: '#48acdb',
            marginLeft: '5%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingLeft: '15px',
            borderRadius: '5px',
        }}>
            Filter word: <span style={{
                paddingLeft: '10px',
                fontWeight: '700',
            }}>{searchName}</span>
        </div>
    ) 
}

export default BottomSearchNameDisplay