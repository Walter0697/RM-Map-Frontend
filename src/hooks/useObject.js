import { useState } from 'react'

function useObject(defaultValue) {
    const [ obj, setObj ] = useState(defaultValue)

    const updateField = (field, value) => {
        setObj(prevObj => ({
            ...prevObj,
            [field]: value,
        }))
    }

    return [ obj, updateField ]
}

export default useObject