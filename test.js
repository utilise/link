var expect = require('chai').expect
  , client = require('client')
  , owner = require('owner')
  , shim = !client && polyfill()
  , realMutationObserver = owner.MutationObserver
  , MutationObserver = mockMutationObserver()
  , attr = require('attr')
  , noop = require('noop')
  , link = require('./')
  , raw = require('raw')
  , node

describe('link', function() {

  before(function(){
    /* istanbul ignore next */
    node = !client ? document.body.firstElementChild
         : document.body.appendChild(document.createElement('div'))
  })

  beforeEach(function(){
    node.innerHTML = '<li class="el1" foo="bar"><li class="el2"></li>'
  })

  afterEach(function(){
    link.links = {}
  })

  after(function(){
    node.parentNode.removeChild(node)
    owner.MutationObserver = realMutationObserver
  })

  it('should link el1[attr1] to el2[attr2] instantly', function() {
    link('.el1[foo]', '.el2[foo]')
    expect(attr(raw('.el2'), 'foo')).to.be.equal('bar')
  })

  it('should link el1[attr1] to el2[attr2] reactively', function(done) {
    link('.el1[foo]', '.el2[foo]')
    expect(attr(raw('.el2'), 'foo')).to.be.equal('bar')

    attr(raw('.el1'), 'foo', 'baz')
    setTimeout(function(){
      expect(attr(raw('.el2'), 'foo')).to.be.equal('baz')
    }, 60)
    setTimeout(done, 90)
  })

  it('should not link if mising elements', function() {
    link('.el3[foo]', '.el2[foo]')
    expect(attr(raw('.el2'), 'foo')).to.not.equal('bar')
  })

  it('should not duplicate existing link', function() {
    link('.el1[foo]', '.el2[foo]')
    link('.el1[foo]', '.el2[foo]')
    expect(link.links).to.eql({ '.el1[foo]|.el2[foo]': true })
  })

})

function polyfill(){
  window = require("jsdom").jsdom('<div></div>').defaultView
  global.document = window.document
}

function mockMutationObserver(){ 
  return owner.MutationObserver = function(fn){ 
    setTimeout(fn, 30)
    return { observe: noop }
  }
}