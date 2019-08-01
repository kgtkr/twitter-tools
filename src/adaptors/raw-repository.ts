import { Raw, RawType } from "../entities/raw";
import { knexClient } from "../knex-client";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { array } from "fp-ts";
import { eitherUnwrap } from "../utils";
import { date } from "io-ts-types/lib/date";

export class RawRepository {
  async insert(raws: Raw[]): Promise<void> {
    await knexClient("raws").insert(
      raws.map(x => ({
        type: x.type,
        id: x.id,
        created_at: x.createdAt,
        raw: JSON.stringify(x.raw)
      }))
    );
  }

  async findLatest(type: RawType, ids: string[]): Promise<Raw[]> {
    const rowType = t.type({
      type: t.union([t.literal("user"), t.literal("status")]),
      id: t.string,
      created_at: date,
      raw: t.unknown
    });

    const res = await knexClient.raw(
      `
      SELECT
        t1.type AS type,
        t1.id AS id,
        t1.created_at AS created_at,
        t1.raw AS raw
      FROM raws AS t1
      WHERE
        t1.type = $1 AND
        t1.id = ANY($2::varchar(32)[]) AND
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
