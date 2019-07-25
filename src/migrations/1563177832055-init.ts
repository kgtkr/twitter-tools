import { psqlPool } from "../psql-pool";

export async function migrate_1563177832055_init() {
  await psqlPool().query(`
    CREATE TABLE ffs (
      id uuid NOT NULL,
      user_id bigint NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      INDEX user_id (user_id),
      INDEX created_at (created_at),
      CONSTRAINT pk PRIMARY KEY (id)
    )
  `);

  await psqlPool().query(`
    CREATE TABLE followers (
      ff_id uuid NOT NULL,
      user_id bigint NOT NULL,
      CONSTRAINT pk
        PRIMARY KEY (ff_id, user_id),
      CONSTRAINT fk_ff_id
        FOREIGN KEY (ff_id)
        REFERENCES ffs (id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    );
  `);

  await psqlPool().query(`
    CREATE TABLE friends (
      ff_id uuid NOT NULL,
      user_id bigint NOT NULL,
      CONSTRAINT pk
        PRIMARY KEY (ff_id, user_id)
      CONSTRAINT fk_ff_id
        FOREIGN KEY (ff_id)
        REFERENCES ffs (id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    )
  `);
}
