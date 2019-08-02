import { Option, some, none } from "fp-ts/lib/Option";

export const safeParseInt: (x: string) => Option<number> = x => {
  const i = +x;
  return Number.isInteger(i) ? some(i) : none;
};
