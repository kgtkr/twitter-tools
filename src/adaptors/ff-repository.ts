import { FFRepository as Port } from "../ports/ff-repository";
import { taskEither, either } from "fp-ts";
import { FF } from "../entities/ff";
import { psqlPool } from "../psql-pool";

export class FFRepository implements Port {
  insert(ff: FF): taskEither.TaskEither<null, null> {
    return async () => {
      psqlPool().query(
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
      return either.right(null);
    };
  }

  findOne(id: string): taskEither.TaskEither<null, FF> {}
}
