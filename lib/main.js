const Promise = require('bluebird')
const pg = require('pg-promise')({promiseLib: Promise})
const Store = require('jsreport-sql-store')

module.exports = function (reporter, definition) {
  if (reporter.options.store.provider !== 'postgres') {
    definition.options.enabled = false
    return
  }

  const db = pg(definition.options)

  reporter.documentStore.registerProvider(Store(definition.options, 'postgres', (a) => {
    return db.result(a.text, a.values, (r) => {
      return {
        records: r.rows,
        rowsAffected: r.rowCount
      }
    })
  }))

  reporter.closeListeners.add('postgres', this, () => db.$pool.end())
}
