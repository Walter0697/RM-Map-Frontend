const validateImage = (url, callback) => {
    var img = new Image()
    img.onload = function() { callback(true) }
    img.onerror = function() { callback(false) }
    img.src = url
}

const isImageSquare = (file, callback) => {
    const imageUrl = URL.createObjectURL(file)
    var img = new Image()
    img.src = imageUrl

    img.onload = function() {
        if (this.height == this.width) {
            callback(true)
        } else {
            callback(false)
        }
    }
    img.onerror = function() {
        callback(false)
    }
}

const generic = {
    validate: validateImage,
    is_square: isImageSquare,
}

export default generic