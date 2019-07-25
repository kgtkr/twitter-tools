import { undefinedUnwrap } from "@kgtkr/utils";

export interface Env {
  app: {
    dir: string;
  };
  psql: {
    host: string;
    port: number;
    database: string;
    user: string;
    pass: string;
  };
}

export const env: Env = {
  app: {
    dir: undefinedUnwrap(process.env["APP_DIR"])
  },
  psql: {
    host: undefinedUnwrap(process.env["PSQL_HOST"]),
    port: Number.parseInt(undefinedUnwrap(process.env["PSQL_PORT"])),
    database: undefinedUnwrap(process.env["PSQL_DATABASE"]),
    user: undefinedUnwrap(process.env["PSQL_USER"]),
    pass: undefinedUnwrap(process.env["PSQL_PASS"])
  }
};
