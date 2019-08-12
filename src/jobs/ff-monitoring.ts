import { sleep, eitherUnwrap } from "../utils";
import { config } from "../config";
import { Twitter } from "../adaptors/twitter";
import { getTwit } from "../twit";
import { FFRepository } from "../adaptors/ff-repository";
import { RawRepository } from "../adaptors/raw-repository";
import uuid from "uuid/v4";
import { array, set } from "fp-ts";
import { isNone } from "fp-ts/lib/Option";
import { eqString } from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/pipeable";
import { UserCache } from "../adaptors/user-cache";
import { Discord } from "../adaptors/discord";
import { mkEmdedUser } from "../mk-embed-user";
import { inspect } from "util";
import { createEnv } from "../create-env";
import { createKnex } from "../create-knex";

// tslint:disable-next-line:no-floating-promises
(async () => {
  const conf = await config();
  const env = eitherUnwrap(createEnv());
  const knexClient = createKnex(env);
  while (true) {
    console.log("job start");
    for (let { token, discord_hook_url } of conf.ff_monitoring.tokens) {
      const now = new Date();
      try {
        const ffRepo = new FFRepository(knexClient);
        const rawRepo = new RawRepository(knexClient);
        const twitter = new Twitter(getTwit(token));
        const userCache = new UserCache(twitter, rawRepo);
        const discord = new Discord();

        console.log("fetch start");
        const userId = await twitter.fetchAuthUserId();

        const followers = await twitter
          .fetchFollowers(userId)
          .then(x => new Set(x));
        const friends = await twitter
          .fetchFriends(userId)
          .then(x => new Set(x));
        console.log("fetch end");

        const ff = {
          id: uuid(),
          userId,
          createdAt: now,
          followers,
          friends
        };

        console.log("save start");
        await ffRepo.insert(ff);
        console.log("save end");

        console.log("history find start");
        const ffs = await ffRepo.findUser(userId, 2);
        console.log("history find end");
        const oFf1 = array.lookup(0, ffs);
        const oFf2 = array.lookup(1, ffs);

        if (isNone(oFf1) || isNone(oFf2)) {
          continue;
        }

        const ff1 = oFf1.value;
        const ff2 = oFf2.value;

        const difference = set.difference(eqString);
        const union = set.union(eqString);

        const welcomeFollowers = difference(ff1.followers, ff2.followers);
        const welcomeFriends = difference(ff1.friends, ff2.friends);
        const byeFollowers = difference(ff2.followers, ff1.followers);
        const byeFriends = difference(ff2.friends, ff1.friends);

        const requireUserIds = pipe(
          new Set<string>(),
          x => union(x, welcomeFollowers),
          x => union(x, welcomeFriends),
          x => union(x, byeFollowers),
          x => union(x, byeFriends)
        );

        if (requireUserIds.size !== 0) {
          console.log("lookupUsers start");
          const userMap = await userCache.lookupUsers(requireUserIds, now);
          console.log("lookupUsers end");

          console.log("notification start");
          await discord.postHook(discord_hook_url, {
            content: "新しいフォロワー",
            embeds: Array.from(welcomeFollowers).map(x =>
              mkEmdedUser(x, userMap.get(x))
            )
          });
          await discord.postHook(discord_hook_url, {
            content: "新しいフォロー",
            embeds: Array.from(welcomeFriends).map(x =>
              mkEmdedUser(x, userMap.get(x))
            )
          });
          await discord.postHook(discord_hook_url, {
            content: "去ったフォロワー",
            embeds: Array.from(byeFollowers).map(x =>
              mkEmdedUser(x, userMap.get(x))
            )
          });
          await discord.postHook(discord_hook_url, {
            content: "去ったフォロー",
            embeds: Array.from(byeFriends).map(x =>
              mkEmdedUser(x, userMap.get(x))
            )
          });
          console.log("notification end");
        }
      } catch (e) {
        console.error(inspect(e, { depth: null }));
      }
    }
    console.log("job end");
    await sleep(conf.ff_monitoring.interval * 1000);
  }
})();
