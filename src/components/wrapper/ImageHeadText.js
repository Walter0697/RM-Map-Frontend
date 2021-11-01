import React from 'react'

function ImageHeadText({
    iconPath,
    iconSize,
    label,
    labelSize,
    labelColor,
    labelBold,
}) {
    return (
        <>
            { iconPath && (
                <img 
                    style={{
                        verticalAlign: 'middle',
                        display: 'inline-block',
                    }}
                    width={iconSize}
                    src={iconPath}
                />
            )}
            <div
                style={{
                    fontSize: labelSize,
                    marginLeft: '5px',
                    verticalAlign: 'middle',
                    display: 'inline-block',
                    color: labelColor,
                    fontWeight: labelBold ? '500' : '',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {label}
            </div>
        </>
    )
}

export default ImageHeadText