import { taskEither } from "fp-ts";
import { FF } from "../entities/ff";

export interface FFRepository {
  insert(ff: FF): taskEither.TaskEither<null, null>;
  findOne(id: string): taskEither.TaskEither<null, FF>;
}
