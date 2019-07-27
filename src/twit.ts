import Twit from "twit";
export function getTwit(auth: Record<"ck" | "cs" | "tk" | "ts", string>) {
  return new Twit({
    consumer_key: auth.ck,
    consumer_secret: auth.cs,
    access_token: auth.tk,
    access_token_secret: auth.ts,
    timeout_ms: 60 * 1000,
    strictSSL: true
  });
}
