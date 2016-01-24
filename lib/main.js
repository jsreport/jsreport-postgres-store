var q = require('q')
var pg = require('pg-promise')({promiseLib: q})
var Store = require('jsreport-sql-store')
var db

module.exports = function (reporter, definition) {
  var options = {}
  definition.enabled = false

  if (reporter.options.connectionString && reporter.options.connectionString.name.toLowerCase() === 'postgres') {
    options = reporter.options.connectionString
    definition.enabled = true
  }

  if (Object.getOwnPropertyNames(definition.options).length) {
    options = definition.options
    reporter.options.connectionString = options
    definition.enabled = true
  }

  if (!definition.enabled) {
    return
  }

  db = pg(reporter.options.connectionString)

  reporter.documentStore.provider = new Store(reporter, 'postgres', function (q) {
    for (var i = 0; i < q.values.length; i++) {
      if (Buffer.isBuffer(q.values[i])) {
        q.values[i] = '\\x' + q.values[i].toString('hex')
      }
    }

    return db.result(q.text, q.values).then(function (res) {
      return {
        records: res.rows,
        rowsAffected: res.rowCount
      }
    })
  })
}
