import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method} ${request.url}]`)
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      fullname: z.string(),
      mail: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    const { fullname, mail, password, confirmPassword } =
      createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 15,
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(mail)) {
      throw new Error('Invalid mail')
    }

    if (password !== confirmPassword) {
      throw new Error('Invalid password')
    }

    await knex('users').insert({
      id: randomUUID(),
      fullname,
      mail,
      password,
      created_at: new Date(),
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/', async (request, reply) => {
    const users = await knex('users').select('*')

    return { users }
  })

  app.get('/:id', async (request, reply) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamsSchema.parse(request.params)

    const user = await knex('users').select('*').where({ id })

    return { user }
  })
}
