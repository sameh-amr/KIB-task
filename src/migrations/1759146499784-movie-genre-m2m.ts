import { MigrationInterface, QueryRunner } from "typeorm";

export class MovieGenreM2m1759146499784 implements MigrationInterface {
    name = 'MovieGenreM2m1759146499784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "movie_genres" ("movie_id" integer NOT NULL, "genre_id" integer NOT NULL, CONSTRAINT "PK_ec45eae1bc95d1461ad55713ffc" PRIMARY KEY ("movie_id", "genre_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae967ce58ef99e9ff3933ccea4" ON "movie_genres" ("movie_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bbbc12542564f7ff56e36f5bbf" ON "movie_genres" ("genre_id") `);
        await queryRunner.query(`ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_ae967ce58ef99e9ff3933ccea48" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_bbbc12542564f7ff56e36f5bbf6" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_bbbc12542564f7ff56e36f5bbf6"`);
        await queryRunner.query(`ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_ae967ce58ef99e9ff3933ccea48"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bbbc12542564f7ff56e36f5bbf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae967ce58ef99e9ff3933ccea4"`);
        await queryRunner.query(`DROP TABLE "movie_genres"`);
    }

}
