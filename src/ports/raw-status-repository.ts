import { RawStatus } from "../entities/raw-status";
import { TaskEither } from "fp-ts/lib/TaskEither";

export interface RawStatusRepository {
  insert(status: RawStatus): TaskEither<null, null>;
  findLatest(ids: string[]): TaskEither<null, RawStatus[]>;
}
