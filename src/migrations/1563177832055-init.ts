import { transaction } from "../psql-pool";

export async function migrate_1563177832055_init() {
  await transaction(async client => {
    await client.query(`
      CREATE TABLE ffs (
        id UUID NOT NULL,
        user_id VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT pk_ffs PRIMARY KEY (id)
      )
    `);

    await client.query(`CREATE INDEX idx_ffs_user_id ON ffs (user_id)`);
    await client.query(`CREATE INDEX idx_ffs_created_at ON ffs (created_at)`);

    await client.query(`
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

    await client.query(`
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

    await client.query(`
      CREATE TYPE raw_type AS ENUM ('user', 'status');
    `);

    await client.query(`
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
