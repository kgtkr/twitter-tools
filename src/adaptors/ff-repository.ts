import { array } from "fp-ts";
import { FF } from "../entities/ff";
import * as t from "io-ts";
import { date } from "io-ts-types/lib/date";
import { pipe } from "fp-ts/lib/pipeable";
import { eitherUnwrap } from "../utils";
import Knex from "knex";

export class FFRepository {
  constructor(private knexClient: Knex<{}, unknown>) {}

  async insert(ff: FF): Promise<void> {
    await this.knexClient.transaction(async trx => {
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

    const rows: unknown[] = await this.knexClient
      .select(
        "id",
        "user_id",
        "created_at",
        this.knexClient
          .select("ARRAY_AGG(user_id)")
          .from("followers")
          .where("ffs.id", this.knexClient.ref("ff_id").withSchema("followers"))
          .as("followers"),
        this.knexClient
          .select("ARRAY_AGG(user_id)")
          .from("friends")
          .where("ffs.id", this.knexClient.ref("ff_id").withSchema("friends"))
          .as("followers")
      )
      .where("user_id", userId)
      .orderBy("created_at", "desc")
      .limit(limit);

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
