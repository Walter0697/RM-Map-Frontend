import React from 'react'

function FilterTitle({
    title,
}) {
    return (
        <div
            style={{
                fontSize: '15px',
                marginBottom: '5px',
                width: '100%',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            {title}
        </div>
    )
}

export default FilterTitle