export interface FF {
  readonly id: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly friends: string[];
  readonly followers: string[];
}
