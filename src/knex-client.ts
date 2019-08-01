import knex from "knex";
import { env } from "./env";

export const knexClient = knex<unknown, unknown>({
  client: "pg",
  connection: {
    host: env.psql.host,
    port: env.psql.port,
    database: env.psql.database,
    user: env.psql.user,
    password: env.psql.pass
  }
});
