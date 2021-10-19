const validateImage = (url, callback) => {
    var img = new Image()
    img.onload = function() { callback(true) }
    img.onerror = function() { callback(false) }
    img.src = url
}

const generic = {
    validate: validateImage,
}

export default generic