# jsreport-postgres-store

**[jsreport](https://github.com/jsreport/jsreport) template store extension allowing to persist data in [PostgreSQL](http://www.postgresql.org/) database**


## Installation

> npm install jsreport-postgres-store

Then alter jsreport configuration 
```js
{
	"connectionString": {
	    "name": "postgres",
        "host": "localhost",
        "port": 5433,
        "database": "jsreport",
        "user": "postgres",
        "password": "password" 
    }
}
```

After jsreport initializes you should see tables like `jsreport.TemplateType` and other in `jsreport` database.

## Schema changes
If you do changes to the database schema by enabling additional extensions you need to drop the affected tables and let jsreport to reinitialize them. 


## jsreport-core
You can apply this extension also manually to [jsreport-core](https://github.com/jsreport/jsreport-core)


```js
var jsreport = require('jsreport-core')()
jsreport.use(require('jsreport-postgres-store')({ host: '...'}))
```




