import knex from "knex";
import { Env } from "./env";
import { Reader } from "fp-ts/lib/Reader";

export const createKnex: Reader<Env, knex<{}, unknown>> = env =>
  knex({
    client: "pg",
    connection: {
      host: env.psql.host,
      port: env.psql.port,
      database: env.psql.database,
      user: env.psql.user,
      password: env.psql.pass
    }
  });
