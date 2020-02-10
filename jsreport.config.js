
module.exports = {
  'name': 'postgres-store',
  'main': './lib/main.js',
  'optionsSchema': {
    store: {
      type: 'object',
      properties: {
        provider: { type: 'string', enum: ['postgres'] }
      }
    },
    extensions: {
      'postgres-store': {
        type: 'object',
        properties: {
          schemaCreation: { type: 'boolean', default: true },
          host: { type: 'string' },
          port: { type: 'number' },
          database: { type: 'string' },
          user: { type: 'string' },
          password: { type: 'string' }
        }
      }
    }
  }
}
