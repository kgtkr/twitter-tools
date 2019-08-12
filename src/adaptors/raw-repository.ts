import { Raw, RawType } from "../entities/raw";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { array } from "fp-ts";
import { eitherUnwrap } from "../utils";
import { date } from "io-ts-types/lib/date";
import Knex from "knex";

export class RawRepository {
  constructor(private knexClient: Knex<{}, unknown>) {}

  async insert(raws: Raw[]): Promise<void> {
    await this.knexClient("raws").insert(
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

    const rows: unknown[] = await this.knexClient
      .select(
        this.knexClient
          .ref("type")
          .withSchema("t1")
          .as("type"),
        this.knexClient
          .ref("id")
          .withSchema("t1")
          .as("id"),
        this.knexClient
          .ref("created_at")
          .withSchema("t1")
          .as("created_at"),
        this.knexClient
          .ref("raw")
          .withSchema("t1")
          .as("raw")
      )
      .from(this.knexClient.ref("raws").as("t1"))
      .where("t1.type", type)
      .whereIn("t1.id", ids)
      .whereNotExists(
        this.knexClient
          .select("*")
          .from(this.knexClient.ref("raws").as("t2"))
          .where("t1.id", "t2.id")
          .where(
            "t1.created_at",
            "<",
            this.knexClient.ref("created_at").withSchema("t2")
          )
      );

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
