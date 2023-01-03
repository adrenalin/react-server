const path = require('path')
const { expect } = require('chai')
const listFilesSync = require('../../../lib/helpers/listFilesSync')

describe('lib/helpers/listFilesSync', () => {
  const resourceDir = path.join(__dirname, '..', '..', 'resources', 'lib', 'helpers', 'listFilesSync')

  it('should list files recursively', (done) => {
    const files = listFilesSync(resourceDir)
    expect(files).to.contain(path.join(resourceDir, 'test.txt'))
    expect(files).to.contain(path.join(resourceDir, 'test.yml'))
    expect(files).to.contain(path.join(resourceDir, 'test-dir', 'test-subdir', 'test.xml'))
    done()
  })

  it('should apply extension filter', (done) => {
    const files = listFilesSync(resourceDir, { ext: 'txt' })
    expect(files).to.contain(path.join(resourceDir, 'test.txt'))
    expect(files).not.to.contain(path.join(resourceDir, 'test.yml'))
    expect(files).not.to.contain(path.join(resourceDir, 'test-dir', 'test-subdir', 'test.xml'))
    done()
  })

  it('should apply extension filter as an array', (done) => {
    const files = listFilesSync(resourceDir, { ext: ['txt', 'yml'] })
    expect(files).to.contain(path.join(resourceDir, 'test.txt'))
    expect(files).to.contain(path.join(resourceDir, 'test.yml'))
    expect(files).not.to.contain(path.join(resourceDir, 'test-dir', 'test-subdir', 'test.xml'))
    done()
  })

  it('should throw an error for an invalid path', (done) => {
    expect(() => listFilesSync(path.join(resourceDir, 'foobar'))).to.throw()
    done()
  })

  it('should accept null options', (done) => {
    listFilesSync(resourceDir, null)
    done()
  })
})
