import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759147853941 implements MigrationInterface {
    name = 'Init1759147853941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ratings" ("id" SERIAL NOT NULL, "userId" character varying(128) NOT NULL, "value" smallint NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "movie_id" integer NOT NULL, CONSTRAINT "UQ_ratings_user_movie" UNIQUE ("userId", "movie_id"), CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ratings_movie" ON "ratings" ("movie_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ratings_user" ON "ratings" ("userId") `);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_45c7bafa4e537191add4eeed5b3" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_45c7bafa4e537191add4eeed5b3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ratings_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ratings_movie"`);
        await queryRunner.query(`DROP TABLE "ratings"`);
    }

}
