import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method} ${request.url}]`)
  })

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      if (!sessionId) {
        throw new Error('Unauthorized user')
      }

      const createMealBodySchema = z.object({
        mealName: z.string(),
        description: z.string(),
        ingestedAt: z.string().optional(),
        insideDietPlan: z.boolean(),
      })

      const { mealName, description, ingestedAt, insideDietPlan } =
        createMealBodySchema.parse(request.body)

      const user = await knex('users').select('*').where({
        session_id: sessionId,
      })

      const userId = user[0].id

      if (!userId) {
        throw new Error('User not found')
      }

      await knex('meals').insert({
        id: randomUUID(),
        meal_name: mealName,
        description,
        ingested_at: ingestedAt ? new Date(ingestedAt) : new Date(),
        inside_diet_plan: insideDietPlan,
        user_id: userId,
      })

      return reply.status(201).send()
    },
  )
}