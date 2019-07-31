import * as t from "io-ts";
import lazyValue from "lazy-value";
import yaml from "js-yaml";
import * as fs from "fs-extra";
import { isRight } from "fp-ts/lib/Either";

const tokenType = t.strict({
  ck: t.string,
  cs: t.string,
  tk: t.string,
  ts: t.string
});

const configType = t.strict({
  consumers: t.array(t.strict({ ck: t.string, cs: t.string })),
  tokens: t.array(tokenType),
  ff_monitoring: t.strict({
    interval: t.number,
    tokens: t.array(t.strict({ discord_hook_url: t.string, token: tokenType }))
  })
});

export const config = lazyValue(async () => {
  const data: unknown = yaml.safeLoad(
    await fs.readFile("config.yaml", { encoding: "utf8" })
  );
  const config = configType.decode(data);
  if (isRight(config)) {
    return config.right;
  } else {
    throw config.left;
  }
});
