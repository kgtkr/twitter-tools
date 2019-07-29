import Twit from "twit";
import * as t from "io-ts";
import { isLeft, Either } from "fp-ts/lib/Either";

export async function fetchAll(
  twit: Twit,
  path: string,
  params: Twit.Params
): Promise<unknown[]> {
  const resType = t.type({ next_cursor_str: t.string });
  const result: unknown[] = [];
  let cursor = "-1";

  while (true) {
    const res = await twit
      .get(path, { ...params, cursor })
      .then(x => x.data)
      .then(x => resType.decode(x));

    if (isLeft(res)) {
      throw res.left;
    }

    result.push(res.right);
    cursor = res.right.next_cursor_str;

    if (res.right.next_cursor_str === "0") {
      break;
    }
  }

  return result;
}
