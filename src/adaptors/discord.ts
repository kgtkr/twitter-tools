import request from "request-promise-native";

export class Discord {
  async postHook(url: string, content: object): Promise<void> {
    await request({
      url,
      method: "POST",
      body: content,
      json: true
    });
  }
}
