import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759150780993 implements MigrationInterface {
    name = 'Init1759150780993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favorites" ("id" SERIAL NOT NULL, "userId" character varying(128) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "movie_id" integer NOT NULL, CONSTRAINT "UQ_favorites_user_movie" UNIQUE ("userId", "movie_id"), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_favorites_movie" ON "favorites" ("movie_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_favorites_user" ON "favorites" ("userId") `);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_558972408544eba5e19428fb8d0" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_558972408544eba5e19428fb8d0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_favorites_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_favorites_movie"`);
        await queryRunner.query(`DROP TABLE "favorites"`);
    }

}
