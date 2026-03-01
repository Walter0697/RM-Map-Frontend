const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`failed to load image: ${src}`))
    image.src = src
})

const normalizeBounds = (pin, width, height) => {
    const left = clamp(Number(pin.top_left_x || 0), 0, width)
    const top = clamp(Number(pin.top_left_y || 0), 0, height)
    const right = clamp(Number(pin.bottom_right_x || 0), 0, width)
    const bottom = clamp(Number(pin.bottom_right_y || 0), 0, height)

    if (right <= left || bottom <= top) {
        throw new Error('invalid pin bounds')
    }

    return { left, top, right, bottom }
}

const generatePinSamplePreview = async ({
    pinImageSrc,
    iconSrc,
    pin,
}) => {
    if (!pinImageSrc || !iconSrc || !pin) {
        throw new Error('missing sample preview input')
    }

    const [pinImage, iconImage] = await Promise.all([
        loadImage(pinImageSrc),
        loadImage(iconSrc),
    ])

    const width = pinImage.naturalWidth || pinImage.width
    const height = pinImage.naturalHeight || pinImage.height
    if (!width || !height) {
        throw new Error('invalid pin image dimensions')
    }

    const bounds = normalizeBounds(pin, width, height)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
        throw new Error('canvas context unavailable')
    }

    context.drawImage(pinImage, 0, 0, width, height)
    context.drawImage(
        iconImage,
        bounds.left,
        bounds.top,
        bounds.right - bounds.left,
        bounds.bottom - bounds.top,
    )

    return canvas.toDataURL('image/png')
}

export {
    generatePinSamplePreview,
}
