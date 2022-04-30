import React from 'react'

function FilterContainer({
    children,
    isSmall,
}) {
    return (
        <div style={{
            height: '100%',
            width: isSmall ? '95%' : '90%',
            backgroundColor: '#83c0ff',
            color: '#0808c1',
            borderRadius: '5px',
            paddingTop: '10px',
            boxShadow: '2px 2px 6px',
        }}>
            {children}
        </div>
    )
}

export default FilterContainer