import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('meal_name').notNullable()
    table.text('description').notNullable()
    table.timestamp('ingested_at').defaultTo(knex.fn.now()).notNullable()
    table.boolean('inside_diet_plan').notNullable()

    table.uuid('user_id').notNullable()
    table.foreign('user_id').references('users.id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
