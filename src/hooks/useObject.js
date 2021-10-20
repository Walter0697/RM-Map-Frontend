import { useState } from 'react'

function useObject(defaultValue) {
    const [ obj, setObj ] = useState(defaultValue)

    const updateField = (field, value) => {
        setObj(prevObj => ({
            ...prevObj,
            [field]: value,
        }))
    }

    const reset = () => {
        setObj(defaultValue)
    }

    return [ obj, updateField, reset ]
}

export default useObject