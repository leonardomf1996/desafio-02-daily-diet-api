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
  }
}
