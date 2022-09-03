// Update with your config settings.
/**

 * @type { Object.<string, import("knex").Knex.Config> }

 */

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.CONNECTION_BD_KEY || 'SEM CONEXÃO COM O BANCO',
  },
};
