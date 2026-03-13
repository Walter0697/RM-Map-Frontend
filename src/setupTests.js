// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

if (typeof window !== 'undefined' && window.URL) {
    if (typeof window.URL.createObjectURL !== 'function') {
        window.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    }
    if (typeof window.URL.revokeObjectURL !== 'function') {
        window.URL.revokeObjectURL = jest.fn()
    }
}

const suppressedWarningPatterns = [
    /MUI Grid: The `item` prop has been removed/i,
    /MUI Grid: The `xs` prop has been removed/i,
    /MUI Grid: The `sm` prop has been removed/i,
    /MUI Grid: The `md` prop has been removed/i,
    /MUI Grid: The `lg` prop has been removed/i,
    /MUI Grid: The `xl` prop has been removed/i,
    /MUI: The GridLegacy component is deprecated/i,
    /React does not recognize the .*fullWidth.* prop on a DOM element/i,
    /Invalid prop `children` supplied to `ForwardRef\(Modal\)`/i,
    /Invalid prop `children` supplied to `FocusTrap`/i,
    /Function components cannot be given refs/i,
    /validateDOMNesting/i,
]

const shouldSuppress = (args) => {
    const message = args.map((arg) => {
        if (typeof arg === 'string') return arg
        if (arg instanceof Error) return arg.message
        try {
            return JSON.stringify(arg)
        } catch (error) {
            return String(arg)
        }
    }).join(' ')
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('react does not recognize') && lowerMessage.includes('fullwidth')) {
        return true
    }

    return suppressedWarningPatterns.some((pattern) => pattern.test(message))
}

const originalConsoleWarn = console.warn
const originalConsoleError = console.error

console.warn = (...args) => {
    if (shouldSuppress(args)) return
    originalConsoleWarn(...args)
}

console.error = (...args) => {
    if (shouldSuppress(args)) return
    originalConsoleError(...args)
}
