const { expect } = require('chai')
const { InvalidArgument } = require('@vapaaradikaali/errors')
const { castToArray } = require('@vapaaradikaali/helpers.js')
const Metadata = require('../../../../client/lib/metadata')

describe('client/lib/metadata', () => {
  it('should set and get the metadata values', (done) => {
    const metadata = new Metadata()
    const testDomain = 'test-domain'
    const testKey = 'test-key'
    const testValue = 'test-value'

    const rval = metadata.set(testDomain, testKey, testValue)
    expect(rval).to.equal(metadata)
    expect(metadata.get(testDomain, testKey)).to.eql(testValue)
    done()
  })

  it('should allow setting an object as the key', (done) => {
    const metadata = new Metadata()
    const testDomain = 'test-domain'
    const testKey = 'test-key'
    const testValue = 'test-value'

    const rval = metadata.set(testDomain, { [testKey]: testValue })
    expect(rval).to.equal(metadata)
    expect(metadata.get(testDomain, testKey)).to.eql(testValue)
    done()
  })

  it('should allow setting an object as domain', (done) => {
    const metadata = new Metadata()
    const testDomain = 'test-domain'
    const testKey = 'test-key'
    const testValue = 'test-value'

    const rval = metadata.set({ [testDomain]: { [testKey]: testValue } })
    expect(rval).to.equal(metadata)
    expect(metadata.get(testDomain, testKey)).to.eql(testValue)
    done()
  })

  it('should throw an InvalidArgument when there is no resolvable domain', (done) => {
    try {
      const metadata = new Metadata()
      metadata.set(['foo'])
      throw new Error('Should have thrown an InvalidArgument')
    } catch (err) {
      console.log(err)
      expect(err).to.be.an.instanceof(InvalidArgument)
      done()
    }
  })

  it('should throw an InvalidArgument when there is no resolvable key', (done) => {
    try {
      const metadata = new Metadata()
      metadata.set({ foo: ['bar'] })
      throw new Error('Should have thrown an InvalidArgument')
    } catch (err) {
      console.log(err)
      expect(err).to.be.an.instanceof(InvalidArgument)
      done()
    }
  })

  it('should bind the given object as the metadata value storage', (done) => {
    const metadata = new Metadata()
    const values = {}

    metadata.bindTo(values)
    expect(metadata.values).to.equal(values)
    done()
  })

  it('should reject a string as an argument to bindTo', (done) => {
    try {
      const metadata = new Metadata()
      metadata.bindTo('foo')
      throw new Error('Should have thrown an InvalidArgument')
    } catch (err) {
      expect(err).to.be.an.instanceof(InvalidArgument)
      done()
    }
  })

  it('should reject a number as an argument to bindTo', (done) => {
    try {
      const metadata = new Metadata()
      metadata.bindTo(1)
      throw new Error('Should have thrown an InvalidArgument')
    } catch (err) {
      expect(err).to.be.an.instanceof(InvalidArgument)
      done()
    }
  })

  it('should reject an array as an argument to bindTo', (done) => {
    try {
      const metadata = new Metadata()
      metadata.bindTo([])
      throw new Error('Should have thrown an InvalidArgument')
    } catch (err) {
      expect(err).to.be.an.instanceof(InvalidArgument)
      done()
    }
  })

  it('should flush the stored values', (done) => {
    const metadata = new Metadata()
    const testDomain = 'test-domain'
    const testKey = 'test-key'
    const testValue = 'test-value'

    const values = {}

    metadata.bindTo(values)
    metadata.set(testDomain, testKey, testValue)
    expect(metadata.values).to.equal(values)
    expect(metadata.get(testDomain, testKey)).to.eql(testValue)

    const flushed = metadata.flush()
    expect(flushed[testDomain][testKey]).to.eql(testValue)

    expect(metadata.values).not.to.equal(values)
    done()
  })

  it('should have a toJSON method', (done) => {
    const metadata = new Metadata()
    const testDomain = 'test-domain'
    const testKey = 'test-key'
    const testValue = 'test-value'

    metadata.set(testDomain, testKey, testValue)

    expect(JSON.stringify(metadata)).to.eql(JSON.stringify({ [testDomain]: { [testKey]: testValue } }))
    done()
  })

  it('should have a method to get stored values', (done) => {
    const metadata = new Metadata()
    const testDomain = 'test-domain'
    const testKey = 'test-key'
    const testValue = 'test-value'

    metadata.set(testDomain, testKey, testValue)

    expect(metadata.getValues()).to.eql({ [testDomain]: { [testKey]: testValue } })
    done()
  })

  it('should append a value', (done) => {
    const metadata = new Metadata()
    const testDomain = 'test-domain'
    const testKey = 'test-key'
    const testValue1 = 'test-value-1'
    const testValue2 = 'test-value-2'

    metadata.set(testDomain, testKey, testValue1)
    metadata.append(testDomain, testKey, testValue2)

    expect(metadata.get(testDomain, testKey)).to.eql([testValue1, testValue2])
    done()
  })

  it('should append only unique values', (done) => {
    const metadata = new Metadata()
    const testDomain = 'test-domain'
    const testKey = 'test-key'
    const testValue1 = 'test-value'
    const testValue2 = 'test-value'

    metadata.set(testDomain, testKey, testValue1)
    metadata.append(testDomain, testKey, testValue2)

    expect(metadata.get(testDomain, testKey)).to.eql(testValue1)
    done()
  })

  it('should trim strings only', (done) => {
    const testArray = [' foo ']

    expect(Metadata.trim(' foo ')).to.eql('foo')
    expect(Metadata.trim(testArray)).to.equal(testArray)

    const metadata = new Metadata()
    expect(metadata.trim).to.equal(Metadata.trim)
    expect(metadata.trim(' foo ')).to.eql('foo')

    done()
  })

  it('should have an opengraph shorthand for opengraph domain', (done) => {
    const metadata = new Metadata()
    const testKey = 'test-key'
    const testValue = 'test-value'

    const rval = metadata.opengraph(testKey, testValue)

    expect(rval).to.equal(metadata)
    expect(metadata.get('opengraph', `og:${testKey}`)).to.equal(testValue)
    done()
  })

  it('should have append when setting og:image', (done) => {
    const metadata = new Metadata()
    const testKey = 'og:image'
    const testValue1 = 'test-image-1'
    const testValue2 = 'test-image-2'

    metadata.opengraph(testKey, testValue1)
    metadata.opengraph(testKey, testValue2)
    expect(metadata.get('opengraph', testKey)).to.eql([testValue1, testValue2])
    done()
  })

  it('should prepend og: to keys that do not have a context definition', (done) => {
    const metadata = new Metadata()
    const testWithoutPrefix = 'test-key'
    const testWithPrefix = 'fb:test-key'

    const testValue = 'test-value'

    metadata.opengraph(testWithoutPrefix, testValue)
    metadata.opengraph(testWithPrefix, testValue)

    expect(metadata.get('opengraph', testWithoutPrefix)).to.eql(null)
    expect(metadata.get('opengraph', `og:${testWithoutPrefix}`)).to.eql(testValue)

    expect(metadata.get('opengraph', testWithPrefix)).to.eql(testValue)
    expect(metadata.get('opengraph', `og:${testWithPrefix}`)).to.eql(null)
    done()
  })

  it('should set opengraph:image with addImage', (done) => {
    const metadata = new Metadata()
    const testSrc = 'test-image-src.png'

    const rval = metadata.addImage(testSrc)

    expect(rval).to.equal(metadata)
    expect(metadata.get('opengraph', 'og:image')).to.contain(testSrc)
    done()
  })

  it('should allow setting an object with key-value pairs with opengraph', (done) => {
    const metadata = new Metadata()
    const testValues = {
      'no-prefix': 'test-no-prefix',
      'tt:with-prefix': 'test-with-prefix'
    }

    metadata.opengraph(testValues)

    expect(metadata.get('opengraph', 'og:no-prefix')).to.eql(testValues['no-prefix'])
    expect(metadata.get('opengraph', 'tt:with-prefix')).to.eql(testValues['tt:with-prefix'])
    done()
  })

  it('should throw an InvalidArgument when trying to set an array with opengraph', (done) => {
    try {
      const metadata = new Metadata()
      metadata.opengraph(['value1', 'value2'])
      throw new Error('Should have thrown an InvalidArgument')
    } catch (err) {
      expect(err).to.be.an.instanceof(InvalidArgument)
      done()
    }
  })

  it('should set status code', (done) => {
    const metadata = new Metadata()

    const rval = metadata.setStatusCode(404)

    expect(rval).to.equal(metadata)
    expect(metadata.get('http', 'status')).to.equal(404)
    done()
  })

  it('should accept only validish status codes', (done) => {
    const metadata = new Metadata()
    const valid = [100, 200, 300, 400, 500]
    const invalid = ['foo', [1], { code: 400 }, 1, 11, 100.1, 601]

    valid.forEach((code) => {
      metadata.setStatusCode(code)
      expect(metadata.get('http', 'status')).to.equal(code)
    })

    invalid.forEach((code) => {
      try {
        metadata.setStatusCode(code)
        throw new Error('Should have thrown an InvalidArgument')
      } catch (err) {
        expect(err).to.be.an.instanceof(InvalidArgument)
      }
    })

    done()
  })

  it('should set location', (done) => {
    const metadata = new Metadata()
    const location = '/tests/client/lib/metadata'

    const rval = metadata.setLocation(location)

    expect(rval).to.equal(metadata)
    expect(metadata.get('http', 'location')).to.equal(location)
    done()
  })

  it('should set page title as a string', (done) => {
    const testTitle = 'test-title'

    const metadata = new Metadata()
    const rval = metadata.setTitle(testTitle)

    expect(rval).to.equal(metadata)
    expect(metadata.get('page', 'title')).to.eql(testTitle)
    done()
  })

  it('should set page title as an array', (done) => {
    const testTitle = ['test-title', 'test-title']

    const metadata = new Metadata()
    const rval = metadata.setTitle(testTitle)

    expect(rval).to.equal(metadata)
    expect(metadata.get('page', 'title')).to.eql(testTitle.join(' | '))
    done()
  })

  it('should ignore empty parts of the title', (done) => {
    const testTitle = ['test-title', null, 'test-title']

    const metadata = new Metadata()
    const rval = metadata.setTitle(testTitle)

    expect(rval).to.equal(metadata)
    expect(metadata.get('page', 'title')).not.to.eql(testTitle.join(' | '))
    expect(metadata.get('page', 'title')).to.eql(testTitle.filter(p => p).join(' | '))
    done()
  })

  it('should get document title', (done) => {
    const testPageTitle = ['test-title-1', 'test-title-2']
    const testSiteTitle = 'test-site-title'

    const metadata = new Metadata()
    metadata.setTitle(testPageTitle)
    metadata.set('site', 'title', testSiteTitle)

    expect(metadata.getDocumentTitle()).to.eql([...testPageTitle, testSiteTitle].join(' | '))
    done()
  })

  it('should set breadcrumb path', (done) => {
    let counter = 0

    const listener = () => {
      counter++
    }

    const invalid = [
      'foo',
      {},
      ['foo'],
      [
        {
          noTo: true,
          label: 'foo'
        }
      ],
      [
        {
          noLabel: true,
          href: '/foo'
        }
      ],
      [
        {
          to: '/foo',
          href: '/foo',
          label: 'ambiguous part'
        }
      ]
    ]

    const valid = [
      [
        {
          href: '/foo',
          label: 'foo'
        },
        {
          to: '/foo/bar',
          label: 'bar'
        }
      ],
      {
        href: '/foo',
        label: 'foo'
      }
    ]

    invalid.forEach((parts) => {
      try {
        const metadata = new Metadata()
        metadata.listen('navigation', 'breadcrumb', listener)

        metadata.setBreadcrumbPath(parts)
        throw new Error('Should have thrown an InvalidArgument')
      } catch (err) {
        expect(err).to.be.an.instanceof(InvalidArgument)
        expect(counter).to.equal(0)
      }
    })

    valid.forEach((parts, i) => {
      const metadata = new Metadata()
      metadata.listen('navigation', 'breadcrumb', listener)
      const rval = metadata.setBreadcrumbPath(parts)

      expect(rval).to.equal(metadata)
      expect(metadata.get('navigation', 'breadcrumb')).to.eql(castToArray(parts))
      expect(metadata.getBreadcrumbPath()).to.eql(castToArray(parts))

      expect(counter).to.equal(i + 1)
    })

    done()
  })

  it('should unlisten a listener', async () => {
    let touched = false
    const metadata = new Metadata()
    const callback = () => {
      touched = true
    }

    metadata.listen('foo', 'bar', callback)
    metadata.unlisten('foo', 'bar', callback)

    await metadata.trigger('foo', 'bar')
    expect(touched).to.equal(false)
  })

  it('should not crash if a listener throws an error', async () => {
    const metadata = new Metadata()
    const callback = () => {
      throw new Error('Listener that throws an error')
    }

    metadata.listen('foo', 'bar', callback)
    await metadata.trigger('foo', 'bar')
  })

  it('should unlisten all registered listeners if listener function is not defined', async () => {
    let touched = false
    const metadata = new Metadata()
    const callback = () => {
      touched = true
    }

    metadata.listen('foo', 'bar', callback)
    metadata.unlisten('foo', 'bar')

    await metadata.trigger('foo', 'bar')
    expect(touched).to.equal(false)
  })

  it('should set page class as a string', (done) => {
    const testClassName = 'test-class-name'
    const metadata = new Metadata()
    const rval = metadata.setPageClass(testClassName)

    expect(rval).to.equal(metadata)
    expect(metadata.get('page', 'className')).to.eql(testClassName)
    done()
  })

  it('should set page class as an array', (done) => {
    const testClassName = ['test-class-name-1 ', null, 'test-class-name-2 ']
    const metadata = new Metadata()
    const rval = metadata.setPageClass(testClassName)

    expect(rval).to.equal(metadata)
    expect(metadata.get('page', 'className')).to.eql('test-class-name-1 test-class-name-2')
    done()
  })

  it('should set page type', (done) => {
    const testPageType = 'test-page-type'
    const metadata = new Metadata()
    const rval = metadata.setPageType(testPageType)

    expect(rval).to.equal(metadata)
    expect(metadata.get('page', 'type')).to.eql(testPageType)
    done()
  })

  it('should append a page class when unique', (done) => {
    const testClassName1 = 'test-class-name-1'
    const testClassName2 = 'test-class-name-2'
    const metadata = new Metadata()

    metadata.setPageClass(testClassName1)
    metadata.addPageClass(testClassName2)
    const rval = metadata.addPageClass(testClassName2)

    expect(rval).to.equal(metadata)
    expect(metadata.get('page', 'className')).to.eql(`${testClassName1} ${testClassName2}`)
    done()
  })

  it('should remove a page class', (done) => {
    const testClassName1 = 'test-class-name-1'
    const testClassName2 = 'test-class-name-2'
    const metadata = new Metadata()

    metadata.setPageClass(testClassName1)
    metadata.addPageClass(testClassName2)
    const rval = metadata.removePageClass(testClassName2)

    expect(rval).to.equal(metadata)
    expect(metadata.get('page', 'className')).to.eql(testClassName1)
    done()
  })
})
