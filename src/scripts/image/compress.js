import { compressAccurately } from 'image-conversion'

const megabyte = 1000000
const targetMemory = 200000

const isImage = (image_data) => {
    if(!(/image/i).test(image_data.type)) {
        return false
    }
    return true
}

const shouldCompress = (image_data) => {
    if (image_data.size > 2 * megabyte) {
        return true
    }
    return false
}

const expectedScaleRatio = (image_data) => {
    // origin_size / target_size = 1 / ratio
    // image_data.size / target_size = 1 / ratio
    // target_size / image_data.size = ratio
    const expected_ratio = targetMemory / image_data.size
    return expected_ratio.toFixed(2) - 0.01
}

const compressImage = async (image_data) => {
    const expected_ratio = expectedScaleRatio(image_data)

    const result = await compressAccurately(image_data, expected_ratio)
    return result
}

const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const compress = {
    isImage,
    shouldCompress,
    compressImage,
    formatBytes,
}

export default compress