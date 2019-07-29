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

export function chunkOf(n: number): <T>(arr: T[]) => T[][] {
  return <T>(arr: T[]) =>
    arr.reduce<T[][]>((prev, x, i) => {
      if (i % n == 0) {
        prev.push([]);
      }

      prev[prev.length - 1].push(x);
      return prev;
    }, []);
}
