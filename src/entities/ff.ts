export interface FF {
  readonly id: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly friends: Set<string>;
  readonly followers: Set<string>;
}
