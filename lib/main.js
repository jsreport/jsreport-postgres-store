const Promise = require('bluebird')
const pg = require('pg-promise')({promiseLib: Promise})
const Store = require('jsreport-sql-store')

module.exports = function (reporter, definition) {
  if (reporter.options.store.provider !== 'postgres') {
    definition.options.enabled = false
    return
  }

  const options = Object.assign({}, reporter.options.store, definition.options)

  const db = pg(options)

  reporter.documentStore.registerProvider(Store(options, 'postgres', (a) => {
    return db.result(a.text, a.values, (r) => {
      return {
        records: r.rows,
        rowsAffected: r.rowCount
      }
    })
  }))
}
