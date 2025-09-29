import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759134313397 implements MigrationInterface {
    name = 'Init1759134313397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "movies" ("id" SERIAL NOT NULL, "tmdbId" integer NOT NULL, "title" character varying(255) NOT NULL, "releaseDate" date, CONSTRAINT "UQ_e9d4a90d2d6a56fd9f9300c9370" UNIQUE ("tmdbId"), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "genres" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, CONSTRAINT "UQ_f105f8230a83b86a346427de94d" UNIQUE ("name"), CONSTRAINT "PK_80ecd718f0f00dde5d77a9be842" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "genres"`);
        await queryRunner.query(`DROP TABLE "movies"`);
    }

}
