import { Either } from "fp-ts/lib/Either";
import { either } from "fp-ts";

export function eitherUnwrap<L, R>(x: Either<L, R>): R {
  if (either.isRight(x)) {
    return x.right;
  } else {
    throw x.left;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
