import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Follower } from "./follower";
import { Friend } from "./friend";

@Entity("ffs")
export class FF {
  @PrimaryGeneratedColumn("uuid", {})
  id!: string;

  @Column("bigint", { name: "user_id" })
  userId!: string;

  @Column("timestamptz", { name: "created_at" })
  createdAt!: Date;

  @OneToMany(_type => Friend, friend => friend.ff)
  friends!: Friend[];

  @OneToMany(_type => Follower, follower => follower.ff)
  followers!: Follower[];
}
