import { Pool } from "pg";
import { env } from "./env";
import lazyValue from "lazy-value";

export const psqlPool = lazyValue(
  () =>
    new Pool({
      host: env.psql.host,
      port: env.psql.port,
      database: env.psql.database,
      user: env.psql.user,
      password: env.psql.pass
    })
);
