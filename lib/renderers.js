const merge = require('./merge')

/* Each renderer are call in webpack context. So `this` is the webpack context */

function ejs(engine, str, locals, options) {
  return engine.render(str, locals, options)
}

function jade(engine, str, locals, options) {
  const opt = merge({}, options, locals)
  return engine.render(str, opt)
}

function handlebars(engine, str, locals, options) {
  const template = engine.compile(str, options)
  return template(locals)
}

function mustache(engine, str, locals, options) {
  return engine.render(str, locals, options)
}

function twig(engine, str, locals, options) {
  const opt = merge({ data: str }, options)

  // This part add all twig files dependencies
  // to make webpack able to watch them
  const registry = [];
  engine.extend((Twig) => {
    const defaultSave = Object.assign(Twig.Templates.save);
    Twig.Templates.save = function customSave(template) {
      if (!registry.includes(template.path)) {
        registry.push(template.path);
      }
      return defaultSave.call(this, template)
    }
  })

  const template = engine.twig(opt)
  const result = template.render(locals)

  registry.forEach(this.addDependency)

  return result
}

function vash(engine, str, locals, options) {
  const template = engine.compile(str, options)
  return template(locals)
}

module.exports = {
  ejs: ejs,
  handlebars: handlebars,
  jade: jade,
  mustache: mustache,
  pug: jade,
  twig: twig,
  vash: vash
}
