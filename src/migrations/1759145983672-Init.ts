import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759145983672 implements MigrationInterface {
    name = 'Init1759145983672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "genres" ADD "tmdbId" integer`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f011e0dcbc9df06a53c4917f59" ON "genres" ("tmdbId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f011e0dcbc9df06a53c4917f59"`);
        await queryRunner.query(`ALTER TABLE "genres" DROP COLUMN "tmdbId"`);
    }

}
