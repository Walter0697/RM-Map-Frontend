const regexp = new RegExp('#([^\\s]*)', 'g')

const checkHashtag = (description) => {
    if (!description) return []

    let tagListArray = []
    const tmplist = description.match(regexp)
    for (const w in tmplist) {
        const hashSub = tmplist[ w ].split('#')
        for (const x in hashSub) {
            if (hashSub[x] != '')
            {
                if (hashSub[x].substr(hashSub[x].length - 1) == ':')
                {
                    hashSub[x] = hashSub[x].slice(0, -1)
                }
                if (hashSub[x] != '') {
                    tagListArray.push(hashSub[x])
                }
            }
        }
    }
    
    return tagListArray
}

const hashtag = {
    check: checkHashtag,
}

export default hashtag