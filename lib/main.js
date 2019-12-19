const Promise = require('bluebird')
const pg = require('pg-promise')({promiseLib: Promise})
const Store = require('jsreport-sql-store')

module.exports = function (reporter, definition) {
  if (reporter.options.store.provider !== 'postgres') {
    definition.options.enabled = false
    return
  }

  const db = pg(definition.options)

  function executeQuery (a, opts = {}) {
    const transform = (r) => {
      return {
        records: r.rows,
        rowsAffected: r.rowCount != null ? r.rowCount : 0
      }
    }

    if (opts.transaction) {
      const tran = opts.transaction
      return tran.execute.result(a.text, a.values, transform)
    }

    return db.result(a.text, a.values, transform)
  }

  const transactionManager = {
    async start () {
      // eslint-disable-next-line promise/param-names
      return new Promise((startResolve, startReject) => {
        let initialized = false
        let transactionEnd

        const transactionEndPromise = new Promise((resolve) => {
          transactionEnd = resolve
        })

        db.tx((t) => {
          initialized = true

          // eslint-disable-next-line promise/param-names
          return new Promise((execResolve, execReject) => {
            const transactionExecute = {
              resolve: execResolve,
              reject: execReject
            }

            const tran = {
              execute: t,
              async commit () {
                transactionExecute.resolve()
                await transactionEndPromise
              },
              async rollback () {
                const error = new Error('Transaction ROLLBACK executed')
                transactionExecute.reject(error)
                await transactionEndPromise
              }
            }

            startResolve(tran)
          })
        }).then(() => {
          transactionEnd()
        }).catch((err) => {
          if (!initialized) {
            startReject(err)
          } else {
            transactionEnd()
          }
        })
      })
    },
    async commit (tran) {
      await tran.commit()
    },
    async rollback (tran) {
      await tran.rollback()
    }
  }

  const store = Object.assign(
    Store(definition.options, 'postgres', executeQuery, transactionManager),
    {
      close: () => {
        return db.$pool.end()
      }
    }
  )

  reporter.documentStore.registerProvider(store)

  // avoid exposing connection string through /api/extensions
  definition.options = {}
}
