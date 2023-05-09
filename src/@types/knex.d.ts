// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      fullname: string
      mail: string
      password: string
      session_id?: string
    }

    meals: {
      id: string
      meal_name: string
      description: string
      ingested_at: Date
      inside_diet_plan: boolean
      user_id: string
    }
  }
}
