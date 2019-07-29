export type RawType = "user" | "status";

export interface Raw {
  readonly type: RawType;
  readonly id: string;
  readonly createdAt: Date;
  readonly raw: unknown;
}
