import Twit from "twit";
import * as t from "io-ts";
import { isRight } from "fp-ts/lib/Either";
import { fetchAll } from "../cursor";
import { array } from "fp-ts";
import { chunkOf, eitherUnwrap } from "../utils";
import { pipe } from "fp-ts/lib/pipeable";
export class Twitter {
  constructor(public readonly twit: Twit) {}

  async fetchAuthUserId(): Promise<string> {
    const resType = t.type({ id_str: t.string });
    const res = await this.twit
      .get("account/verify_credentials")
      .then(x => x.data)
      .then(x => resType.decode(x))
      .then(eitherUnwrap);

    return res.id_str;
  }

  async fetchFollowers(userId: string): Promise<string[]> {
    const resType = t.type({ ids: t.array(t.string) });
    return await fetchAll(this.twit, "followers/ids", {
      user_id: userId,
      count: 200,
      stringify_ids: true
    })
      .then(x => x.map(x => resType.decode(x)).map(eitherUnwrap))
      .then(x => array.flatten(x.map(x => x.ids)));
  }

  async fetchFriends(userId: string): Promise<string[]> {
    const resType = t.type({ ids: t.array(t.string) });
    return await fetchAll(this.twit, "friends/ids", {
      user_id: userId,
      count: 200,
      stringify_ids: true
    })
      .then(x => x.map(x => resType.decode(x)).map(eitherUnwrap))
      .then(x => array.flatten(x.map(x => x.ids)));
  }

  async lookupUsers(ids: string[]): Promise<({ id_str: string } & object)[]> {
    return pipe(
      ids,
      chunkOf(100),
      array.map(async ids => {
        const resType = t.array(t.type({ id_str: t.string }));
        return await this.twit
          .get("users/lookup", { user_id: ids.join(",") })
          .then(x => x.data)
          .then(x => resType.decode(x))
          .then(eitherUnwrap);
      }),
      ps => Promise.all(ps).then(x => array.flatten(x))
    );
  }
}
