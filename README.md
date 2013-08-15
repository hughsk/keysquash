# keysquash [![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

Keysquash is an experimental JS "compression" pass that stores an index of
long, frequently used key names (e.g. `addEventListener`) and refers to that
instead.

For example:

``` javascript
document.body.addEventListener('mousedown', function(e) {
  console.log('down', e.offsetX, e.offsetY)
})
document.body.addEventListener('mouseup', function(e) {
  console.log('up', e.offsetX, e.offsetY)
})
```

Would be transformed into this:

``` javascript
(function($__ks_) {
  document.body[$__ks_._]('mousedown', function(e) {
    console.log('down', e[$__ks_.$], e[$__ks_.a])
  })
  document.body[$__ks_._]('mousedown', function(e) {
    console.log('down', e[$__ks_.$], e[$__ks_.a])
  })
})({
    "_": "addEventListener"
  , "$": "offsetX"
  , "a": "offsetY"
})
```

Which can then get minified using `uglifyjs -cm` for further savings.

In practice it's a little smarter about making sure that replacing keys
provides a file size improvement too, but make sure to double check this.

**This is only worth using in special cases such as
[js13kgames](http://js13kgames.com/). I'm not sure of all of the side-effects
yet.**

## Installation ##

``` bash
npm install -g keysquash
```

## Usage ##

``` bash
cat index.js | keysquash | uglifyjs -cm
```
