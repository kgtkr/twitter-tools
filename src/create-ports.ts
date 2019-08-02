import { Ports } from "./ports";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { right } from "fp-ts/lib/Either";

export const createPorts: TaskEither<never, Ports> = async () => right({});
