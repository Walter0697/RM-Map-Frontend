import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname)

describe('roroadlist removal regression checks', () => {
  test('graphql index no longer exports roroadlists', () => {
    const graphqlIndex = fs.readFileSync(path.join(root, 'graphql/index.js'), 'utf8')
    expect(graphqlIndex).not.toMatch(/roroadlists/)
  })

  test('reducers index no longer registers roroadlist slice', () => {
    const reducersIndex = fs.readFileSync(path.join(root, 'store/reducers/index.js'), 'utf8')
    expect(reducersIndex).not.toMatch(/roroadlist/)
  })
})
