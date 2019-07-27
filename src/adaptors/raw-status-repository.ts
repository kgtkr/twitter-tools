import { RawStatus } from "../entities/raw-status";
import { psqlPool } from "../psql-pool";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { array } from "fp-ts";
import { eitherUnwrap } from "../utils";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";

export class RawStatusRepository {
  async insert(status: RawStatus): Promise<void> {
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
  }

  async findLatest(ids: string[]): Promise<RawStatus[]> {
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

    return pipe(
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
    );
  }
}
