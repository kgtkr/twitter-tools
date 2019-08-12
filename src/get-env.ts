import { IO } from "fp-ts/lib/IO";
import { Option, fromNullable } from "fp-ts/lib/Option";

export const getEnv: (key: string) => IO<Option<string>> = key => () =>
  fromNullable(process.env[key]);
