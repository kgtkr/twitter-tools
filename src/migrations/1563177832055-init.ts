import { knexClient } from "../knex-client";

export async function migrate_1563177832055_init() {
  await knexClient.transaction(async trx => {
    await trx.raw(`
      CREATE TABLE ffs (
        id UUID NOT NULL,
        user_id VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT pk_ffs PRIMARY KEY (id)
      )
    `);

    await trx.raw(`CREATE INDEX idx_ffs_user_id ON ffs (user_id)`);
    await trx.raw(`CREATE INDEX idx_ffs_created_at ON ffs (created_at)`);

    await trx.raw(`
      CREATE TABLE followers (
        ff_id UUID NOT NULL,
        user_id VARCHAR(32) NOT NULL,
        CONSTRAINT pk_followers
          PRIMARY KEY (ff_id, user_id),
        CONSTRAINT fk_followers_ff_id
          FOREIGN KEY (ff_id)
          REFERENCES ffs (id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      );
    `);

    await trx.raw(`
      CREATE TABLE friends (
        ff_id UUID NOT NULL,
        user_id VARCHAR(32) NOT NULL,
        CONSTRAINT pk_friends
          PRIMARY KEY (ff_id, user_id),
        CONSTRAINT fk_friends_ff_id
          FOREIGN KEY (ff_id)
          REFERENCES ffs (id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      )
    `);

    await trx.raw(`
      CREATE TYPE raw_type AS ENUM ('user', 'status');
    `);

    await trx.raw(`
      CREATE TABLE raws (
        type raw_type NOT NULL,
        id VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        raw JSON NOT NULL,
        CONSTRAINT pk
          PRIMARY KEY (type, id, created_at)
      )
    `);
  });
}
