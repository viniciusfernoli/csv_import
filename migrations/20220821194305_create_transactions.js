/**

 * @param { import("knex").Knex } knex

 * @returns { Promise<void> }

 */

exports.up = function (knex) {
  return knex.schema.createTable('transactions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('origin_bank').notNullable();
    table.string('origin_branch').notNullable();
    table.string('origin_account').notNullable();
    table.string('destination_bank').notNullable();
    table.string('destination_branch').notNullable();
    table.string('destination_account').notNullable();
    table.bigInteger('amount_in_cents').notNullable();
    table.datetime('date').notNullable();
    table.timestamps(true, true);
  });
};

/**

 * @param { import("knex").Knex } knex

 * @returns { Promise<void> }

 */

exports.down = function (knex) {
  return knex.schema.dropTable('transactions');
};
