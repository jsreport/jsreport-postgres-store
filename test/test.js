require('should')
process.env.DEBUG = 'jsreport'
const jsreport = require('jsreport-core')

describe('common store tests', () => {
  let reporter

  beforeEach(async () => {
    reporter = jsreport({
      store: { provider: 'postgres' }
    }).use(require('../')({
      'host': 'localhost',
      'port': 5432,
      'database': 'jsreport',
      'user': 'postgres',
      'password': 'password'
    }))

    await reporter.init()

    const drop = reporter.documentStore.provider.drop.bind(reporter.documentStore.provider)

    reporter.documentStore.provider.drop = async () => {
      await drop()
      return reporter.documentStore.init()
    }
  })

  afterEach(() => reporter.close())

  jsreport.tests.documentStore()(() => reporter.documentStore)
})
