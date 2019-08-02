import { knexClient } from "../knex-client";

export async function migrate_1563177832055_init() {
  await knexClient.transaction(async trx => {
    await trx.schema.createTable("ffs", table => {
      table.uuid("id").notNullable();
      table.string("user_id", 32).notNullable();
      table.timestamp("created_at", { useTz: true }).notNullable();

      table.primary(["id"], "pk_ffs");
      table.index(["user_id"], "idx_ffs_user_id");
      table.index(["created_at"], "idx_ffs_created_at");
    });

    await trx.schema.createTable("followers", table => {
      table.uuid("ff_id").notNullable();
      table.string("user_id", 32).notNullable();

      table.primary(["ff_id", "user_id"], "pk_followers");
      table
        .foreign("ff_id", "fk_followers_ff_id")
        .references("ffs.id")
        .onDelete("NO ACTION")
        .onUpdate("NO ACTION");
    });

    await trx.schema.createTable("friends", table => {
      table.uuid("ff_id").notNullable();
      table.string("user_id", 32).notNullable();

      table.primary(["ff_id", "user_id"], "pk_followers");
      table
        .foreign("ff_id", "fk_friends_ff_id")
        .references("ffs.id")
        .onDelete("NO ACTION")
        .onUpdate("NO ACTION");
    });

    await trx.schema.createTable("raws", table => {
      table.enum("type", ["user", "status"]).notNullable();
      table.string("id", 32).notNullable();
      table.timestamp("created_at", { useTz: true }).notNullable();
      table.json("raw").notNullable();

      table.primary(["type", "id", "created_at"], "pk_raws");
    });
  });
}
