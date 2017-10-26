var Promise = require('bluebird')
var pg = require('pg-promise')({promiseLib: Promise})

// https://github.com/vitaly-t/pg-promise/issues/389#issuecomment-325141741
var moment = require('moment')
pg.pg.types.setTypeParser(1114, function (str) {
  return moment.utc(str).toDate()
})

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

  reporter.documentStore.provider = new Store(reporter, 'postgres', function (a) {
    return db.result(a.text, a.values, function (r) {
      return {
        records: r.rows,
        rowsAffected: r.rowCount
      }
    })
  })
}
