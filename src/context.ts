import { Env } from "./env";
import knex from "knex";

export interface Context {
  env: Env;
  ports: {};
  knex: knex<{}, unknown>;
}
