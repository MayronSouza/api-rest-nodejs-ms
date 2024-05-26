import fastify from 'fastify'
import { connection } from './database'

const app = fastify()

app.get('/', async () => {
  const tables = await connection('sqlite_schema').select('*')

  return tables
})

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('HTTP Server running...'))
