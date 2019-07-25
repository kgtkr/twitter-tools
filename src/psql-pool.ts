import { Pool, PoolClient } from "pg";
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

export async function transaction<T>(
  f: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await psqlPool().connect();
  let res;
  try {
    await client.query("BEGIN");
    res = await f(client);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  return res;
}
