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

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      if (!sessionId) {
        throw new Error('Unauthorized user')
      }

      const updateMealParamsSchema = z.object({
        id: z.string(),
      })

      const updateMealBodySchema = z.object({
        mealName: z.string(),
        description: z.string(),
        ingestedAt: z.string().optional(),
        insideDietPlan: z.boolean(),
      })

      const { id } = updateMealParamsSchema.parse(request.params)

      const { mealName, description, ingestedAt, insideDietPlan } =
        updateMealBodySchema.parse(request.body)

      const user = await knex('users').select('*').where({
        session_id: sessionId,
      })

      const userId = user[0].id

      if (!userId) {
        throw new Error('User not found')
      }

      const meal = await knex('meals').select('*').where({ id })

      if (!meal) {
        throw new Error('Meal not found')
      }

      await knex('meals')
        .update({
          meal_name: mealName,
          description,
          ingested_at: ingestedAt ? new Date(ingestedAt) : new Date(),
          inside_diet_plan: insideDietPlan,
        })
        .where({
          id,
          user_id: userId,
        })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      if (!sessionId) {
        throw new Error('Unauthorized user')
      }

      const updateMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = updateMealParamsSchema.parse(request.params)

      const user = await knex('users').select('*').where({
        session_id: sessionId,
      })

      const userId = user[0].id

      if (!userId) {
        throw new Error('User not found')
      }

      const meal = await knex('meals').select('*').where({ id })

      if (!meal) {
        throw new Error('Meal not found')
      }

      await knex('meals').where('id', id).del()

      return reply.status(204).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      if (!sessionId) {
        throw new Error('Unauthorized user')
      }

      const user = await knex('users').select('*').where({
        session_id: sessionId,
      })

      const userId = user[0].id

      if (!userId) {
        throw new Error('User not found')
      }

      const findMeals = await knex('meals').select('*').where('user_id', userId)

      if (!findMeals) {
        throw new Error('Meals not found')
      }

      const meals = findMeals.map((meal) => {
        const ingested = new Date(meal.ingested_at)

        return {
          ...meal,
          ingested_at: ingested,
        }
      })

      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      if (!sessionId) {
        throw new Error('Unauthorized user')
      }

      const user = await knex('users').select('*').where({
        session_id: sessionId,
      })

      const userId = user[0].id

      if (!userId) {
        throw new Error('User not found')
      }

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const findMeal = await knex('meals').select('*').where({ id })

      if (!findMeal) {
        throw new Error('Meal not found')
      }

      const ingested = new Date(findMeal[0].ingested_at)

      delete findMeal[0].ingested_at

      const meal = {
        ...findMeal[0],
        ingested_at: ingested,
      }

      return { meal }
    },
  )
}
