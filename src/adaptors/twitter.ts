import Twit from "twit";
import * as t from "io-ts";
import { isRight } from "fp-ts/lib/Either";
import { fetchAll } from "../cursor";
import { array } from "fp-ts";
import { chunkOf } from "../utils";
import { pipe } from "fp-ts/lib/pipeable";
export class Twitter {
  constructor(public readonly twit: Twit) {}

  async fetchAuthUserId(): Promise<string> {
    const resType = t.type({ id_str: t.string });
    const res = await this.twit
      .get("account/verify_credentials")
      .then(x => x.data)
      .then(x => resType.decode(x));

    if (isRight(res)) {
      return res.right.id_str;
    } else {
      throw res.left;
    }
  }

  async fetchFollowers(userId: string): Promise<string[]> {
    const resType = t.type({ ids: t.array(t.string) });
    return await fetchAll(this.twit, "followers/ids", {
      user_id: userId
    })
      .then(x =>
        x
          .map(x => resType.decode(x))
          .map(x => {
            if (isRight(x)) {
              return x.right.ids;
            } else {
              throw x.left;
            }
          })
      )
      .then(x => array.flatten(x));
  }

  async fetchFriends(userId: string): Promise<string[]> {
    const resType = t.type({ ids: t.array(t.string) });
    return await fetchAll(this.twit, "friends/ids", {
      user_id: userId
    })
      .then(x =>
        x
          .map(x => resType.decode(x))
          .map(x => {
            if (isRight(x)) {
              return x.right.ids;
            } else {
              throw x.left;
            }
          })
      )
      .then(x => array.flatten(x));
  }

  async lookupUsers(ids: string[]): Promise<({ id_str: string } & object)[]> {
    return pipe(
      ids,
      chunkOf(100),
      array.map(async ids => {
        const resType = t.array(t.type({ id_str: t.string }));
        const res = await this.twit
          .get("users/lookup", { user_id: ids.join(",") })
          .then(x => x.data)
          .then(x => resType.decode(x));

        if (isRight(res)) {
          return res.right;
        } else {
          throw res.left;
        }
      }),
      ps => Promise.all(ps).then(x => array.flatten(x))
    );
  }
}
