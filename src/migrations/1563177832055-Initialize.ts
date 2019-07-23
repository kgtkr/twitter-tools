import {MigrationInterface, QueryRunner} from "typeorm";

export class Initialize1563177832055 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "followers" ("ff_id" uuid NOT NULL, "user_id" bigint NOT NULL, CONSTRAINT "PK_e14c4e2fbd8d9e8d4c7ce9cacee" PRIMARY KEY ("ff_id", "user_id"))`);
        await queryRunner.query(`CREATE TABLE "friends" ("ff_id" uuid NOT NULL, "user_id" bigint NOT NULL, CONSTRAINT "PK_cb023db8497f38983cd32bb2cbe" PRIMARY KEY ("ff_id", "user_id"))`);
        await queryRunner.query(`CREATE TABLE "ffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" bigint NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_3aafcf1f514ba8081fa2b5e8611" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "followers" ADD CONSTRAINT "FK_4e95bbb3b6295093da918c65dac" FOREIGN KEY ("ff_id") REFERENCES "ffs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_1b22edd2e8900c95ff6b7b7690a" FOREIGN KEY ("ff_id") REFERENCES "ffs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_1b22edd2e8900c95ff6b7b7690a"`);
        await queryRunner.query(`ALTER TABLE "followers" DROP CONSTRAINT "FK_4e95bbb3b6295093da918c65dac"`);
        await queryRunner.query(`DROP TABLE "ffs"`);
        await queryRunner.query(`DROP TABLE "friends"`);
        await queryRunner.query(`DROP TABLE "followers"`);
    }

}
