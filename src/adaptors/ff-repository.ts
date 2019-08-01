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
      await trx.raw(
        `
          INSERT INTO ffs (
            id,
            user_id,
            created_at
          )
          VALUES (
            $1,
            $2,
            $3
          )
        `,
        [ff.id, ff.userId, ff.createdAt]
      );

      for (let follower of Array.from(ff.followers)) {
        await trx.raw(
          `
            INSERT INTO followers (
              ff_id,
              user_id
            )
            VALUES (
              $1,
              $2
            )
          `,
          [ff.id, follower]
        );
      }

      for (let friend of Array.from(ff.friends)) {
        await trx.raw(
          `
            INSERT INTO friends (
              ff_id,
              user_id
            )
            VALUES (
              $1,
              $2
            )
          `,
          [ff.id, friend]
        );
      }
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

    const res = await knexClient.raw(
      `
        SELECT
          ffs.id AS id,
          MAX(ffs.user_id) AS user_id,
          MAX(ffs.created_at) AS created_at,
          ARRAY_AGG(followers.user_id) AS followers,
          ARRAY_AGG(friends.user_id) AS friends
        FROM ffs
        LEFT OUTER JOIN followers
          ON ffs.id = followers.ff_id
        LEFT OUTER JOIN friends
          ON ffs.id = friends.ff_id
        WHERE
          ffs.user_id = $1
        GROUP BY ffs.id
        ORDER BY created_at
        LIMIT $2
      `,
      [userId, limit]
    );

    const rows: unknown[] = res.rows;

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
