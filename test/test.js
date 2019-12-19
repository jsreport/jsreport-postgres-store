require('should')
process.env.DEBUG = 'jsreport'
const jsreport = require('jsreport-core')

describe('common store tests', () => {
  let reporter

  async function createReporter () {
    const instance = jsreport({
      store: { provider: 'postgres' }
    }).use(require('../')({
      'host': 'localhost',
      'port': 5432,
      'database': 'jsreport',
      'user': 'postgres',
      'password': 'password'
    })).use(() => {
      jsreport.tests.documentStore().init(() => instance.documentStore)
    })

    await instance.init()

    return instance
  }

  before(async () => {
    reporter = await createReporter()
    await reporter.documentStore.drop()
    await reporter.close()
  })

  beforeEach(async () => {
    reporter = await createReporter()
    await jsreport.tests.documentStore().clean(() => reporter.documentStore)
  })

  afterEach(() => reporter.close())

  jsreport.tests.documentStore()(() => reporter.documentStore)
})
