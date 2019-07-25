import { FFRepository as Port } from "../ports/ff-repository";
import { taskEither, either, array, option } from "fp-ts";
import { FF } from "../entities/ff";
import { transaction, psqlPool } from "../psql-pool";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { Either } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
export class FFRepository implements Port {
  insert(ff: FF): taskEither.TaskEither<null, null> {
    return async () => {
      await transaction(async client => {
        await client.query(
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

        await Promise.all(
          Array.from(ff.followers).map(follower => {
            client.query(
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
          })
        );

        await Promise.all(
          Array.from(ff.friends).map(friend => {
            client.query(
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
          })
        );
      });

      return either.right(null);
    };
  }

  findOne(id: string): taskEither.TaskEither<null, FF> {
    return async () => {
      const rowType = t.type({
        id: t.string,
        user_id: t.string,
        created_at: DateFromISOString,
        followers: t.array(t.string),
        friends: t.array(t.string)
      });

      const res = await psqlPool().query(
        `
          SELECT
            MAX(ffs.id) AS id,
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
            ffs.id = $1
          GROUP BY ffs.id
        `,
        [id]
      );

      const rows: unknown[] = res.rows;

      return pipe(
        rows,
        array.head,
        option.map(x => either.right<null, unknown>(x)),
        option.getOrElse(() => either.left(null)),
        either.map(x =>
          pipe(
            x,
            x => rowType.decode(x),
            eitherUnwrap
          )
        ),
        either.map(x => ({
          id: x.id,
          userId: x.user_id,
          createdAt: x.created_at,
          followers: new Set(x.followers),
          friends: new Set(x.friends)
        }))
      );
    };
  }
}

function eitherUnwrap<L, R>(x: Either<L, R>): R {
  if (either.isRight(x)) {
    return x.right;
  } else {
    throw x.left;
  }
}
