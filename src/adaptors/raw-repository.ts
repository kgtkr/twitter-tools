import { Raw, RawType } from "../entities/raw";
import { psqlPool } from "../psql-pool";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { array } from "fp-ts";
import { eitherUnwrap } from "../utils";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";

export class RawRepository {
  async insert(raw: Raw): Promise<void> {
    await psqlPool().query(
      `
      INSERT INTO raws (
        type,
        id,
        created_at,
        raw
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      )
    `,
      [raw.type, raw.id, raw.createdAt, JSON.stringify(raw.raw)]
    );
  }

  async findLatest(type: RawType, ids: string[]): Promise<Raw[]> {
    const rowType = t.type({
      type: t.union([t.literal("user"), t.literal("status")]),
      id: t.string,
      created_at: DateFromISOString,
      raw: t.unknown
    });

    const res = await psqlPool().query(
      `
      SELECT
        t1.type AS type,
        t1.id AS id,
        t1.created_at AS created_at,
        t1.raw AS raw
      FROM raws AS t1
      WHERE
        t1.type = $1 AND
        t1.id = ANY($2::int[]) AND
        NOT EXISTS (
          SELECT *
          FROM raws AS t2
          WHERE
            t1.id = t2.id AND
            t1.created_at < t2.created_at
        )
    `,
      [type, ids]
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
            type: x.type,
            id: x.id,
            createdAt: x.created_at,
            raw: x.raw
          })
        )
      )
    );
  }
}
