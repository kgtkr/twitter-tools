import * as fs from "fs-extra";
import * as path from "path";
import { env } from "../env";
import { migrate } from "../migrate";

// tslint:disable-next-line:no-floating-promises
(async () => {
  const migrateFile = path.join(env.app.dir, "./migrate.json");

  const ver = await fs
    .readFile(migrateFile, "utf8")
    .then(json => JSON.parse(json) as number)
    .catch(() => 0);
  console.log("current db-version", ver);
  const newVer = await migrate(ver);
  console.log("updated db-version", newVer);
  await fs.writeFile(migrateFile, JSON.stringify(newVer), {
    encoding: "utf8"
  });
  process.exit(0);
})();
