import compiler from './compiler.js'
import helpers from './helpers'

test('Renders a Pug template', async () => {
  const options = {
    engine: 'pug',
    locals: {
      title: 'Pug Template',
      desc: 'A template rendered by Pug'
    }
  }

  const stats = await compiler('data/source.pug', options)
  const output = stats.toJson().modules[0].source
  const source = helpers.value(output)

  expect(source).toContain('<h1>Pug Template</h1>')
  expect(source).toContain('<h2>A template rendered by Pug</h2>')
})