import { Twitter } from "./twitter";
import { RawRepository } from "./raw-repository";
import { set, map } from "fp-ts";
import { eqString } from "fp-ts/lib/Eq";

export class UserCache {
  constructor(
    public readonly twitter: Twitter,
    public readonly rawRepo: RawRepository
  ) {}

  async lookupUsers(
    ids: Set<string>,
    now: Date
  ): Promise<Map<string, unknown>> {
    const dbUsers = await this.rawRepo
      .findLatest("user", Array.from(ids))
      .then(x => new Map(x.map(x => [x.id, x.raw])));

    const difference = set.difference(eqString);

    const fetchedUserArr = await this.twitter.lookupUsers(
      Array.from(difference(ids, new Set(dbUsers.keys())))
    );

    await this.rawRepo.insert(
      fetchedUserArr.map(user => ({
        type: "user",
        id: user.id_str,
        createdAt: now,
        raw: user
      }))
    );

    const fetchedUsers = new Map<string, unknown>(
      fetchedUserArr.map(x => [x.id_str, x])
    );

    return new Map([...Array.from(dbUsers), ...Array.from(fetchedUsers)]);
  }
}
