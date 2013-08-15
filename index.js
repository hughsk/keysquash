var generate = require('escodegen').generate
var bases = require('bases').toAlphabet
var falafel = require('falafel')

module.exports = keysquash

function keysquash(src, options) {
  options = options || {}

  var index = options.index || '$__ks_'
  var keys = {}
  var n = 0

  falafel(String(src), function(node) {
    if (node.type === 'MemberExpression' && !node.computed) {
      var key = node.property.value || node.property.name
      keys[key] = keys[key] || 0
      keys[key] += 1
    }
  })

  var toReplace = Object.keys(keys).map(function(key) {
    return {
        name: key
      , unmodified: keys[key] * key.length
      , updated: key.length + 16
    }
  }).filter(function(key) {
    return key.unmodified > key.updated && key.name.length > 6
  }).map(function(key) {
    key.replacement = bases(n++, '_$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
    return key
  }).reduce(function(memo, key) {
    memo[key.name] = key
    delete key.name
    return memo
  }, {})

  var map = Object.keys(toReplace).reduce(function(memo, key) {
    memo[toReplace[key].replacement] = key
    return memo
  }, {})

  var body = '(function(' + index + ') {\n'

  body += falafel(String(src), function(node) {
    if (node.type === 'MemberExpression' && !node.computed) {
      if (node.property.type === 'Literal') {
        var key = node.property.value
        if (toReplace.hasOwnProperty(key)) {
          node.property.update(index + '.' + toReplace[key].replacement)
        }
      } else {
        var key = node.property.name
        if (toReplace.hasOwnProperty(key)) {
          node.computed = true
          node.property = {
              type: 'MemberExpression'
            , computed: false
            , object: { type: 'Identifier', name: index }
            , property: { type: 'Identifier', name: toReplace[key].replacement }
          }
          node.update(generate(node))
        }
      }
    }
  })

  body += '})(' + JSON.stringify(map) + ')'

  return body
}

// console.log(
//   keysquash(require('fs').readFileSync(__filename))
// )
