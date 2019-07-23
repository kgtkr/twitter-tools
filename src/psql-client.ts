import { Client } from "pg";
import { env } from "./env";
import lazyValue from "lazy-value";

export const psqlClient = lazyValue(async () => {
  const client = new Client({
    host: env.psql.host,
    port: env.psql.port,
    database: env.psql.database,
    user: env.psql.user,
    password: env.psql.pass
  });
  await client.connect();
  return client;
});
