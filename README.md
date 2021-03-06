# Render Template Loader
[![Build Status](https://travis-ci.org/jabney/render-template-loader.svg?branch=master)](https://travis-ci.org/jabney/render-template-loader)

Render templates with Webpack using one of any number of templating engines.

See [The Demo Project](https://github.com/jabney/render-template-loader-demo) for an example webpack project setup that uses `render-template-loader` with `ejs` to render `index.html`, and in the same config renders `pug` and `handlebars` templates as well.

See [unit tests](https://github.com/jabney/render-template-loader/tree/master/test) and [webpack.config.js](https://github.com/jabney/render-template-loader/blob/master/dev/webpack.config.js) for other usage examples.

Built-in support for and tested with: `ejs`, `handlebars`, `jade`, `mustache`, `pug`, `twig`, and `vash`.

Partials support tested with `ejs`, `handlebars`, `jade`, `twig`, and `pug`.

Custom engine support included; see [loader.spec.js](https://github.com/jabney/render-template-loader/blob/master/test/loader.spec.js).

## Installation

### Install `render-template-loader`

```bash
> npm install render-template-loader
```

### Install a template engine or two

```bash
> npm install ejs pug
```

## Examples

### Render `index.html` from an `ejs` template

#### index.ejs (input)
```html
<!doctype html>
<html lang="en">
  <head><title><%=title%></title></head>
  <body>
    <% include body %>
  </body>
</html>

```

#### body.ejs (partial)
```html
<h1><%=title%></h1>
<h2><%=desc%></h2>
```

#### webpack.config.js (config)

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\/src\/index.ejs$/,
      use: [{
        loader: 'render-template-loader',
        options: {
          engine: 'ejs',
          locals: {
            title: 'Render Template Loader',
            desc: 'Rendering templates with a Webpack loader since 2017'
          },
          engineOptions: function (info) {
            // Ejs wants the template filename for partials rendering.
            // (Configuring a "views" option can also be done.)
            return { filename: info.filename }
          }
        }
      }]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.ejs'
    })
  ]
}
```

#### index.html (output)
```html
<!doctype html>
<html lang="en">
<head><title>Render Template Loader</title></head>
<body>
  <h1>Render Template Loader</h1>
  <h2>Rendering templates with a Webpack loader since 2017</h2>

<script type="text/javascript" src="main.bundle.js"></script></body>
</html>
```

### Render `page.html` from a `pug` template

#### page.pug (input)
```html
<!doctype html>
html(lang="en")
  head
    title #{title}
  body
    include body
```

#### body.pug (partial)
```html
<h1>#{title}</h1>
<h2>#{desc}</h2>
```

#### webpack.config.js (config)

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\.pug$/,
      use: [{
        loader: 'file-loader?name=[name].html'
      },
      {
        /**
         * We use extract-loader in this configuration because
         * file-loader above expects a string. In other configs,
         * we use HtmlWebpackLoader which handles the module
         * output of render-template-loader, so extract-loader
         * is not required.
         */
        loader: 'extract-loader'
      },
      {
        loader: 'render-template-loader',
        options: {
          engine: 'pug',
          locals: {
            title: 'Rendered with Pug!',
            desc: 'Partials Support'
          },
          engineOptions: function (info) {
            return { filename: info.filename }
          }
        }
      }]
    }]
  },
  plugins: []
}
```

#### page.html (output)
```html
<!doctype html>
<html lang="en">
  <head><title>Rendered with Pug!</title></head>
<body>
  <h1>Rendered with Pug!</h1>
  <h2>Partials Support</h2>
</body>
</html>
```

## Loader Options

```javascript
options: {
  // The name of the engine as installed by npm (required).
  engine: 'engine name' | function (template, locals, options) {),
  // Template variables (optional).
  locals: {...} | function () { return {...} },
  // Options specific to the engine (optional).
  engingeOptions: {} | function (info) {}
  // Called before the template is rendered (optional).
  init: function (engine, info, options) {}
}
```

`engine (string|function)`: **(required)** the name of the template engine as installed, e.g., `ejs`, or a custom engine function that returns the rendered template.
It can’t be a arrow function because we use `.call()` to have webpack context as `this`.

```javascript
engine: 'ejs',
locals: {
  title: 'Ejs Template',
  desc: 'A template rendered by ejs'
}
```

```javascript
engine: function (input, locals, engineOptions) {
  return ejs.render(input, locals, engineOptions)
},
locals: {
  title: 'Custom Template',
  desc: 'A template rendered by a custom function (using ejs)'
}
```

```javascript
engine: function (input, locals) {
  return input.replace(/#\{(.+?)\}/g, function (match, p1) {
    return locals[p1]
  })
},
locals: {
  title: 'Custom Template',
  desc: 'A template rendered by a custom function (using regex)'
}
```

`locals (object)`: **(optional)** an object containing variables used by the template. A local variable `title` will be used by a template, e.g., `<%= title %>`.

```javascript
locals: {
  title: 'Ejs Template',
  desc: 'A template rendered by ejs'
}
```

`locals` can also be a function that returns a locals object:

```javascript
  locals: function () {
    return {
      title: 'Ejs Template',
      desc: 'A template rendered by ejs'
    }
  }
```

```html
<h1><%= title %></h1>
<h2><%= desc %></h2>
```

`engineOptions (object|function)`: **(optional)** an options object passed to the template engine when it's loaded. The content of this object is determined by each engine's configuration. For simple template rendering (without partials) `engineOptions` isn't usually required.

```javascript
engineOptions: {
  views: ['./src/views']
}
```

```javascript
engineOptions: function (info) {
  // The info object contains the filename of the
  // template being rendered.
  return { filename: info.filename }
}
```

`init (function)`: **(optional)** a function called before the template is rendered. This is useful for engines that might require setup code to run before use. For instance, `handlebars` partials can be configured by calling `handlebars.registerPartial`.

```javascript
engine: 'handlebars',
locals: {
  title: 'Handlebars Template',
  desc: 'A template rendered by Handlebars'
},
init: function (engine, info) {
  engine.registerPartial('description', '<h2>{{ desc }}</h2>')
}
```

### The Loader Context

Options which can be functions have their `this` context set to the loader context. This allows for advanced usage, such as adding webpack dependencies on the fly. See the webpack documentation on the [LoaderContext](https://webpack.js.org/api/loaders/#the-loader-context) for its api methods.

#### Example

**json data**

```json
{
  "title": "Locals as a Function with addDependency",
  "desc": "The locals function can use the loader context"
}
```

**loader configuration**

```javascript
{
  loader: 'render-template-loader',
  options: {
    engine: 'ejs',
    engineOptions: function (info) {
      // Ejs wants the template filename for partials rendering.
      // (Configuring a "views" option can also be done.)
      return { filename: info.filename }
    },
    locals: function () {
      const file = path.join(__dirname, './data/locals.json')
      // Access the loader context's addDependency method to
      // add a data file dependency.
      this.addDependency(file)
      const buffer = fs.readFileSync(file)
      // Return the loaded json as the locals.
      return JSON.parse(buffer.toString())
    }
  }
}
```

## FAQ

> Why do some configurations use `extract-loader` and others do not?

`render-template-loader` exports the rendered template as a `commonjs` javascript module:

```javascript
module.exports = "<h1>Pug Template</h1><h2>A template rendered by Pug</h2>"
```

In many cases, such as when using `HtmlWebpackPlugin`, this is exactly what you want, because module code is expected. In other cases, such as when using `file-loader` or `html-loader` or some other loader that expects plain text, `extract-loader` manages extracting the stirng from the module's output:

```
<h1>Pug Template</h1><h2>A template rendered by Pug</h2>
```

**with extract-loader**

```javascript
/**
 * Use extract-loader because we're using file loader instead of
 * HtmlWebpackPlugin.
 */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\.pug$/,
      use: [{
        loader: 'file-loader?name=[name].html'
      },
      {
        /**
         * We use extract-loader in this configuration because
         * file-loader above expects a string. In other configs,
         * we use HtmlWebpackLoader which handles the module
         * output of render-template-loader, so extract-loader
         * is not required.
         */
        loader: 'extract-loader'
      },
      {
        loader: 'render-template-loader',
        options: {
          engine: 'pug',
          locals: {
            title: 'Rendered with Pug!',
            desc: 'Partials Support'
          },
          engineOptions: function (info) {
            return { filename: info.filename }
          }
        }
      }]
    }]
  },
  plugins: []
}
```

**without extract loader**

```javascript
/**
 * No need for extract-loader here because HtmlWebpackPlugin is
 * handling the index.ejs file.
 *
 */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\/src\/index.ejs$/,
      use: [{
        loader: 'render-template-loader',
        options: {
          engine: 'ejs',
          locals: {
            title: 'Render Template Loader',
            desc: 'Rendering templates with a Webpack loader since 2017'
          },
          engineOptions: function (info) {
            // Ejs wants the template filename for partials rendering.
            // (Configuring a "views" option can also be done.)
            return { filename: info.filename }
          }
        }
      }]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      // Tell HtmlWebpackPlugin about our index.ejs template.
      template: 'src/index.ejs'
    })
  ]
}
```
