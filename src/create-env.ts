import { IOEither } from "fp-ts/lib/IOEither";
import { Either } from "fp-ts/lib/Either";
import { Option, none, some } from "fp-ts/lib/Option";
import { option, io, either } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { getEnv } from "./get-env";
import { flow, constant } from "fp-ts/lib/function";
import { Do } from "fp-ts-contrib/lib/Do";
import { ioEither } from "fp-ts/lib/IOEither";
import { safeParseInt } from "./safe-parse-int";
import { Env } from "./env";

export type EnvError = { key: string; parse: Option<string> };

export const showEnvError: (e: EnvError) => string = e =>
  `[env error] key:'${e.key}' ${pipe(
    e.parse,
    option.getOrElse(() => "not found")
  )}`;

const getParsedEnv: <A>(
  parser: (value: string) => Either<string, A>
) => (key: string) => IOEither<EnvError, A> = parser => key =>
  pipe(
    key,
    getEnv,
    io.map(
      flow(
        either.fromOption(constant({ key, parse: none })),
        either.chain(
          flow(
            parser,
            either.mapLeft(parse => ({
              key,
              parse: some(parse)
            }))
          )
        )
      )
    )
  );

export const createEnv: IOEither<EnvError, Env> = Do(ioEither)
  .bindL("appDir", () => getParsedEnv(either.right)("APP_DIR"))
  .bindL("psqlHost", () => getParsedEnv(either.right)("PSQL_HOST"))
  .bindL("psqlPort", () =>
    getParsedEnv(
      flow(
        safeParseInt,
        either.fromOption(constant("parse error"))
      )
    )("PSQL_PORT")
  )
  .bindL("psqlDataBase", () => getParsedEnv(either.right)("PSQL_DATABASE"))
  .bindL("psqlUser", () => getParsedEnv(either.right)("PSQL_USER"))
  .bindL("psqlPass", () => getParsedEnv(either.right)("PSQL_PASS"))
  .return(
    ({ appDir, psqlHost, psqlPort, psqlDataBase, psqlUser, psqlPass }) => ({
      app: {
        dir: appDir
      },
      psql: {
        host: psqlHost,
        port: psqlPort,
        database: psqlDataBase,
        user: psqlUser,
        pass: psqlPass
      }
    })
  );
