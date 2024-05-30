import { FastifyInstance } from 'fastify'
import { connection } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/', async () => {
    const transactions = await connection('transactions').select()

    return { transactions }
  })

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await connection('transactions').where('id', id)

    return { transaction }
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await connection('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/summary', async () => {
    const summary = await connection('transactions')
      .sum('amount', {
        as: 'amount',
      })
      .first()

    return { summary }
  })
}
