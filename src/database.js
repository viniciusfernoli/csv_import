import knex from 'knex';
import configuration from '../knexfile';

const environment = 'development';
const connection = knex(configuration[environment]);

export default connection;
