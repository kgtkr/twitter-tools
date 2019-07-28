import { transaction } from "../psql-pool";

export async function migrate_1563177832055_init() {
  await transaction(async client => {
    await client.query(`
      CREATE TABLE ffs (
        id UUID NOT NULL,
        user_id BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        INDEX user_id (user_id),
        INDEX created_at (created_at),
        CONSTRAINT pk PRIMARY KEY (id)
      )
    `);

    await client.query(`
      CREATE TABLE followers (
        ff_id UUID NOT NULL,
        user_id BIGINT NOT NULL,
        CONSTRAINT pk
          PRIMARY KEY (ff_id, user_id),
        CONSTRAINT fk_ff_id
          FOREIGN KEY (ff_id)
          REFERENCES ffs (id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      );
    `);

    await client.query(`
      CREATE TABLE friends (
        ff_id UUID NOT NULL,
        user_id BIGINT NOT NULL,
        CONSTRAINT pk
          PRIMARY KEY (ff_id, user_id),
        CONSTRAINT fk_ff_id
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
        id BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        raw JSON NOT NULL,
        CONSTRAINT pk
          PRIMARY KEY (type, id, created_at)
      )
    `);
  });
}
