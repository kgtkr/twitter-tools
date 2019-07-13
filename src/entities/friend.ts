import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { FF } from "./ff";

@Entity("friends")
export class Friend {
  @PrimaryColumn("uuid", { name: "ff_id" })
  ffId!: string;

  @ManyToOne(_type => FF, ff => ff.friends)
  @JoinColumn({ name: "ff_id" })
  ff!: FF;

  @PrimaryColumn("bigint", { name: "user_id" })
  userId!: string;
}
