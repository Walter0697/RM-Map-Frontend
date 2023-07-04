import dayjs from 'dayjs'
import constants from '../../constant'

const previewWidth = 500
const imageWidth = 450
const contentWidth = 430
const backgroundColor = '#b2d2a4'

const imageTopMargin = 50
const imageBottomMargin = 50

const iconBgOffset = 15
const iconBgRadius = 60
const iconBgColor = '#83c0ffd6'
const iconOffset = 5
const iconImageSize = 100

const titleFont = 'bold 35px serif'
const titleHeight = 38
const titleColor = '#0808c1'
const titleBottomMargin = 10
const titleLeftMargin = 10

const addressFont = 'italic 25px serif'
const addressColor = 'blue'
const addressHeight = 28
const addressBottomMagin = 15

const descriptionFont = '25px serif'
const descriptionColor = '#0808c1'
const descriptionHeight = 28
const descriptionBottomMargin = 20

const attributeHeight = 180
const attributeBackgroundColor = '#83c0ffd6'
const attributeSpaceBetween = 15
const attributeBottomMargin = 30
const attributeColor = '#0808c1'
const attributeFont = '30px serif'
const attributeYOffset = -30

const attributeEmojiFont = 'bold 100px serif'
const attributeEmojiXOffset = 15
const attributeEmojiYOffset = -80

const dateRangeFont = 'italic 25px serif'
const dateRangeColor = '#0808c1'
const dateRangeHeight = 50
const dateBottomMargin = 35


const preloadImage = async (imageLink) => {
    const img = new Image
    img.src = imageLink
    img.crossOrigin = 'anonymous'
    await img.decode()
    return img
}

const drawCircle = (ctx, color, x, y, size) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x + size, y + size, size, 0, 2 * Math.PI, false)
    ctx.fill()
}

const getWrapText = (ctx, text, font, max_width) => {
    ctx.font = font
    // split text with space first
    const text_arr = text.split('')

    let result = []
    let currentAppendingText = ''
    for (let i = 0; i < text_arr.length; i++) {
        const currentText = text_arr[i]

        const currentTesting = currentAppendingText + currentText
        const width = ctx.measureText(currentTesting).width
        if (width > max_width) {
            result.push(currentAppendingText)
            currentAppendingText = currentText
        } else {
            currentAppendingText = currentTesting
        }
    }

    if (currentAppendingText) {
        result.push(currentAppendingText)
    }
   
    return result
}

const generatePreviewImage = async (marker, eventIcon) => {
    let previewHeight = 0
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const eventIconLink = constants.BackendImageLink + eventIcon.icon_path
    const iconImg = await preloadImage(eventIconLink)

    let img = null
    let imgDesiredWidth = imageWidth
    let imgDesiredHeight = imageWidth
    if (marker.image_link) {
        const imageLink = constants.BackendImageLink + marker.image_link
        img = await preloadImage(imageLink)
    
        imgDesiredWidth = imageWidth
        imgDesiredHeight = (imgDesiredWidth / img.width) * img.height 
    }

    const labelArr = getWrapText(ctx, marker.label, titleFont, contentWidth)
    const descriptionArr = getWrapText(ctx, marker.description, descriptionFont, contentWidth)
    const addressArr = getWrapText(ctx, marker.address, addressFont, contentWidth)

    previewHeight += imageTopMargin + imgDesiredHeight + imageBottomMargin
    previewHeight += labelArr.length * titleHeight + titleBottomMargin
    previewHeight += addressArr.length * addressHeight + addressBottomMagin
    previewHeight += descriptionArr.length * descriptionHeight + descriptionBottomMargin
    previewHeight += attributeHeight + attributeBottomMargin
    if (marker.to_time || marker.from_time) {
        previewHeight += dateRangeHeight + dateBottomMargin
    }

    canvas.width = previewWidth
    canvas.height = previewHeight

    // after deciding the dimension of the image, draw everything
    
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, previewWidth, previewHeight)

    const imageLeftMargin = ( previewWidth - imageWidth ) / 2
    if (img) {
        ctx.drawImage(img, imageLeftMargin, imageTopMargin, imgDesiredWidth, imgDesiredHeight)
        
        drawCircle(ctx, iconBgColor, imageLeftMargin - iconBgOffset, imageTopMargin - iconBgOffset, iconBgRadius)
        ctx.drawImage(iconImg, imageLeftMargin - iconOffset, imageTopMargin - iconOffset, iconImageSize, iconImageSize)
    } else {
        ctx.drawImage(iconImg, imageLeftMargin, imageTopMargin, imgDesiredWidth, imgDesiredHeight)
    }
    

    ctx.fillStyle = titleColor
    ctx.font = titleFont
    for (let i = 0; i < labelArr.length; i++) {
        const textYPos = imageTopMargin + imgDesiredHeight + imageBottomMargin + i * titleHeight
        const textXPos = imageLeftMargin + titleLeftMargin
        ctx.fillText(labelArr[i], textXPos, textYPos)
    }

    const titleBottom = imageTopMargin + imgDesiredHeight + imageBottomMargin + labelArr.length * titleHeight + titleBottomMargin

    ctx.fillStyle = addressColor
    ctx.font = addressFont
    for (let i = 0; i < addressArr.length; i++) {
        const textYPos = titleBottom + i * addressHeight
        const textXPos = imageLeftMargin + titleLeftMargin
        ctx.fillText(addressArr[i], textXPos, textYPos)
    }

    const addressBottom = titleBottom + addressArr.length * addressHeight + addressBottomMagin

    ctx.fillStyle = descriptionColor
    ctx.font = descriptionFont
    for (let i = 0; i < descriptionArr.length; i++) {
        const textYPos = addressBottom + i * descriptionHeight
        const textXPos = imageLeftMargin + titleLeftMargin
        ctx.fillText(descriptionArr[i], textXPos, textYPos)
    }

    const descriptionBottom = addressBottom + descriptionArr.length * descriptionHeight + descriptionBottomMargin

    const attributeWidth = (contentWidth - attributeSpaceBetween * 2) / 3

    ctx.fillStyle = attributeBackgroundColor 
    ctx.font = attributeEmojiFont
    let currentX = imageLeftMargin + titleLeftMargin

    ctx.fillRect(currentX, descriptionBottom, attributeWidth, attributeHeight)
    ctx.fillText('⏱️', currentX + attributeEmojiXOffset, descriptionBottom + attributeHeight + attributeEmojiYOffset)

    currentX += attributeWidth + attributeSpaceBetween
    ctx.fillRect(currentX, descriptionBottom, attributeWidth, attributeHeight)
    const bookingEmoji = marker.need_booking ? '📅' : '🚶'
    ctx.fillText(bookingEmoji, currentX + attributeEmojiXOffset, descriptionBottom + attributeHeight + attributeEmojiYOffset)
    
    currentX += attributeWidth + attributeSpaceBetween
    ctx.fillRect(currentX, descriptionBottom, attributeWidth, attributeHeight)
    let moneyEmoji = '💵'
    if (marker.price === 'middle') moneyEmoji = '💰'
    if (marker.price === 'expensive') moneyEmoji = '💸'
    
    ctx.fillText(moneyEmoji, currentX + attributeEmojiXOffset, descriptionBottom + attributeHeight + attributeEmojiYOffset)

    ctx.fillStyle = attributeColor 
    ctx.font = attributeFont
    ctx.textAlign = 'center'
    currentX = imageLeftMargin + titleLeftMargin
    const timeValue = marker.estimate_time
    ctx.fillText(timeValue, currentX + attributeWidth / 2, descriptionBottom + attributeHeight + attributeYOffset)

    currentX += attributeWidth + attributeSpaceBetween
    const booking = marker.need_booking ? 'booking' : 'walkin'
    ctx.fillText(booking, currentX + attributeWidth / 2, descriptionBottom + attributeHeight + attributeYOffset)
   
    currentX += attributeWidth + attributeSpaceBetween
    const price = marker.price
    ctx.fillText(price, currentX + attributeWidth / 2, descriptionBottom + attributeHeight + attributeYOffset)
    
    if (marker.to_time || marker.from_time) {
        const attributeBottom = descriptionBottom + attributeHeight + attributeBottomMargin
        ctx.fillStyle = dateRangeColor
        ctx.font = dateRangeFont
        ctx.textAlign = 'left'
        let dateRangeText = ''
        if (marker.to_time && marker.from_time) {
            dateRangeText = dayjs(marker.from_time).format('YYYY-MM-DD HH:mm') + ' - ' + dayjs(marker.to_time).format('YYYY-MM-DD HH:mm')
        } else if (marker.to_time) {
            dateRangeText = 'Ends at: ' + dayjs(marker.to_time).format('YYYY-MM-DD HH:mm')
        } else if (marker.from_time) {
            dateRangeText = 'Starting from: ' + dayjs(marker.from_time).format('YYYY-MM-DD HH:mm')
        }
        ctx.fillText(dateRangeText, imageLeftMargin + titleLeftMargin, attributeBottom + dateRangeHeight)
    }

    const url = canvas.toDataURL('image/png')
    return url
}

const preview = {
    generatePreviewImage,
}

export default preview