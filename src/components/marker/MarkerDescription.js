import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'

import actions from '../../store/actions'

const regexp = new RegExp('#([^\\s]*)', 'g')

function MarkerDescription({
    description,
    onHashTagClick,
    dispatch,
}) {
    const displayText = useMemo(() => {
        const tmplist = description.match(regexp)
        let output = description
        for (const w in tmplist) {
            const hashtag = tmplist[w]
            output = output.replace(hashtag, `<span style="color: blue; font-weight: 800" class="hashtagText">${hashtag}</span>`)
        }
        return output
    }, [description])

    useEffect(() => {
        const allHashTag = document.getElementsByClassName('hashtagText')

        for (let i = 0; i < allHashTag.length; i++) {
            const hashTagOnClick = () => {
                const current = allHashTag[i].innerText
            
                dispatch(actions.updateFilter({
                    hashtag: [ current.replace('#', '') ],
                }))
                onHashTagClick()
            }
            allHashTag[i].addEventListener('click', hashTagOnClick, false)
        }
    }, [displayText])

    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                overflowX: 'hidden',
            }}
        >
            <div dangerouslySetInnerHTML={{__html: displayText}} />
        </div>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(MarkerDescription)