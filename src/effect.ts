import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither";
import { Ports } from "./ports";

export type Effect<R extends keyof Ports, E, A> = ReaderTaskEither<
  Pick<Ports, R>,
  E,
  A
>;
