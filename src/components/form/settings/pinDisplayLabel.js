export function getPinDisplayLabel(pin) {
    const label = `${pin?.label ?? ''}`.trim()
    if (label) {
        return label
    }

    const value = `${pin?.value ?? ''}`.trim()
    if (value) {
        return value
    }

    return ''
}
