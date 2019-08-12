import * as t from "io-ts";
import { Option, fromEither } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { either } from "fp-ts";
import { identity } from "fp-ts/lib/function";

export function mkEmdedUser(id: string, data: unknown): object {
  const userType = t.type({
    id_str: t.string,
    name: t.string,
    screen_name: t.string,
    description: t.string,
    followers_count: t.number,
    friends_count: t.number,
    favourites_count: t.number,
    statuses_count: t.number,
    profile_image_url_https: t.string
  });

  return pipe(
    userType.decode(data),
    either.map(user =>
      identity<object>({
        title: `${user.id_str}@${user.screen_name}`,
        url: `https://twitter.com/intent/user?user_id=${user.id_str}`,
        image: {
          url: user.profile_image_url_https
        },
        fields: [
          {
            name: "id",
            value: user.id_str
          },
          {
            name: "名前",
            value: user.name
          },
          {
            name: "スクリーンネーム",
            value: `@${user.screen_name}`
          },
          {
            name: "ツイート数",
            value: user.statuses_count.toString()
          },
          {
            name: "フォロー数",
            value: user.friends_count.toString()
          },
          {
            name: "フォロワー数",
            value: user.followers_count.toString()
          },
          {
            name: "ファボ数",
            value: user.favourites_count.toString()
          },
          {
            name: "bio",
            value: user.description
          }
        ]
      })
    ),
    either.getOrElse(() =>
      identity<object>({
        title: `不明なユーザー(${id})`,
        url: `https://twitter.com/intent/user?user_id=${id}`
      })
    )
  );
}
