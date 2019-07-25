import { RawStatusRepository as Port } from "../ports/raw-status-repository";
import { RawStatus } from "../entities/raw-status";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { psqlPool } from "../psql-pool";
import { right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { either, array } from "fp-ts";
import { eitherUnwrap } from "../utils";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";

export class RawStatusRepository implements Port {
  insert(status: RawStatus): TaskEither<null, null> {
    return async () => {
      await psqlPool().query(
        `
        INSERT INTO raw_statuses (
          id,
          created_at,
          raw
        )
        VALUES (
          $1,
          $2,
          $3
        )
      `,
        [status.id, status.createdAt, JSON.stringify(status.raw)]
      );

      return right(null);
    };
  }

  findLatest(ids: string[]): TaskEither<null, RawStatus[]> {
    return async () => {
      const rowType = t.type({
        id: t.string,
        created_at: DateFromISOString,
        raw: t.unknown
      });

      const res = await psqlPool().query(
        `
        SELECT
          t1.id AS id,
          t1.created_at AS created_at,
          t1.raw AS raw
        FROM raw_statuses AS t1
        WHERE
          t1.id = ANY($1::int[]) AND
          NOT EXISTS (
            SELECT *
            FROM raw_statuses AS t2
            WHERE
              t1.id = t2.id AND
              t1.created_at < t2.created_at
          )
      `,
        [ids]
      );

      const rows: unknown[] = res.rows;

      return either.right(
        pipe(
          rows,
          array.map(x =>
            pipe(
              x,
              x => rowType.decode(x),
              eitherUnwrap,
              x => ({
                id: x.id,
                createdAt: x.created_at,
                raw: x.raw
              })
            )
          )
        )
      );
    };
  }
}
