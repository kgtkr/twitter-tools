import { array } from "fp-ts";
import { FF } from "../entities/ff";
import { knexClient } from "../knex-client";
import * as t from "io-ts";
import { date } from "io-ts-types/lib/date";
import { pipe } from "fp-ts/lib/pipeable";
import { eitherUnwrap } from "../utils";
export class FFRepository {
  async insert(ff: FF): Promise<void> {
    await knexClient.transaction(async trx => {
      await trx("ffs").insert({
        id: ff.id,
        user_id: ff.userId,
        created_at: ff.createdAt
      });

      await trx("followers").insert(
        Array.from(ff.followers).map(x => ({ ff_id: ff.id, user_id: x }))
      );

      await trx("friends").insert(
        Array.from(ff.friends).map(x => ({ ff_id: ff.id, user_id: x }))
      );
    });
  }

  async findUser(userId: string, limit: number): Promise<FF[]> {
    const rowType = t.type({
      id: t.string,
      user_id: t.string,
      created_at: date,
      followers: t.array(t.string),
      friends: t.array(t.string)
    });

    const rows: unknown[] = await knexClient
      .raw(
        `
        SELECT
          id,
          user_id,
          created_at,
          (SELECT ARRAY_AGG(user_id) FROM followers WHERE ffs.id = followers.ff_id) AS followers,
          (SELECT ARRAY_AGG(user_id) FROM friends WHERE ffs.id = friends.ff_id) AS friends
        FROM ffs
        WHERE
          user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
        [userId, limit]
      )
      .then(x => x.rows);

    return pipe(
      rows,
      array.map(x =>
        pipe(
          x,
          x => rowType.decode(x),
          eitherUnwrap
        )
      ),
      array.map(x => ({
        id: x.id,
        userId: x.user_id,
        createdAt: x.created_at,
        followers: new Set(x.followers),
        friends: new Set(x.friends)
      }))
    );
  }
}
