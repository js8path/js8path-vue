// config file for JsDoc documentation generator
// jsdoc.config.js
module.exports = {
  plugins: [],
  recurseDepth: 3,
  source: {
    include: [
      'src'
    ],
    includePattern: '.+\\.(js)$',
    excludePattern: '(^|\\/|\\\\)_'
  },
  sourceType: 'module',
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc', 'closure']
  },
  templates: {
    cleverLinks: false,
    monospaceLinks: false
  },
  opts: {
    destination: './doc/jsdoc',
    readme: 'README.md',
    recurse: true
  }
}