import fs from 'fs'
import path from 'path'

describe('desktop layout contract page wiring', () => {
    test('scoped pages consume Base desktopPageKey contract', () => {
        const expectations = [
            { relativePath: '../../pages/HomePage.js', key: 'home' },
            { relativePath: '../../pages/SchedulePage.js', key: 'schedule' },
            { relativePath: '../../pages/SettingPage.js', key: 'setting' },
        ]

        expectations.forEach(({ relativePath, key }) => {
            const filePath = path.resolve(__dirname, relativePath)
            const source = fs.readFileSync(filePath, 'utf8')
            const expectedCallsite = `<Base desktopPageKey='${key}'>`

            expect(source.includes(expectedCallsite)).toBe(true)
        })
    })
})

