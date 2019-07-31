import { Either } from "fp-ts/lib/Either";
import { either } from "fp-ts";
import SQL, { SQLStatement } from "sql-template-strings";

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

export function joinStatements(
  separator: SQLStatement,
  parts: SQLStatement[]
): SQLStatement {
  const result = SQL``;
  for (let i = 0, count = parts.length; i < count; i++) {
    result.append(parts[i]);
    if (i < count - 1) {
      result.append(separator);
    }
  }

  return result;
}
