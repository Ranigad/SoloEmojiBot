import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1553409036964 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "friend" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_a" varchar NOT NULL, "user_b" varchar NOT NULL, "a_follows" boolean NOT NULL DEFAULT (0), "b_follows" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`CREATE TABLE "guild" ("guild_id" varchar PRIMARY KEY NOT NULL, "prefix" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "master_meguca" ("jpn_name" varchar PRIMARY KEY NOT NULL, "eng_sur" varchar, "eng_given" varchar, "nick" varchar, "meguca_type" integer)`);
        await queryRunner.query(`CREATE TABLE "master_memoria" ("jpn_name" varchar PRIMARY KEY NOT NULL, "eng_name" varchar, "active" boolean, "rating" integer)`);
        await queryRunner.query(`CREATE TABLE "memoria" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "lbCount" integer NOT NULL DEFAULT (0), "level" integer NOT NULL DEFAULT (1), "masterMemoriaJpnName" varchar, "megucaId" integer)`);
        await queryRunner.query(`CREATE TABLE "meguca" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "support_type" integer NOT NULL, "bonus" integer, "level" integer NOT NULL DEFAULT (1), "magia_level" integer NOT NULL DEFAULT (1), "revision" integer NOT NULL DEFAULT (0), "slots" integer NOT NULL DEFAULT (0), "attack" integer NOT NULL DEFAULT (1), "defense" integer NOT NULL DEFAULT (1), "hp" integer NOT NULL DEFAULT (1), "masterMegucaJpnName" varchar, "userUserId" varchar)`);
        await queryRunner.query(`CREATE TABLE "magi_reco_user" ("user_id" varchar PRIMARY KEY NOT NULL, "friend_id" varchar NOT NULL, "display_name" varchar NOT NULL, "user_rank" integer NOT NULL, "class_rank" varchar, "last_access" datetime, "comment" varchar DEFAULT (''), "addtimestamp" datetime NOT NULL, "updatetimestamp" datetime, CONSTRAINT "UQ_1020adbefb1629c1b77280e9237" UNIQUE ("friend_id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("username" varchar PRIMARY KEY NOT NULL, "role" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "user" ("username" varchar PRIMARY KEY NOT NULL, "discordname" varchar NOT NULL, "discriminator" varchar, "displayname" varchar NOT NULL, "friend_id" varchar NOT NULL, "notifications" boolean NOT NULL DEFAULT (0), "addtimestamp" datetime NOT NULL DEFAULT (datetime('now')), "deleted" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`CREATE TABLE "temporary_memoria" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "lbCount" integer NOT NULL DEFAULT (0), "level" integer NOT NULL DEFAULT (1), "masterMemoriaJpnName" varchar, "megucaId" integer, CONSTRAINT "FK_e8065bacbc8b63e1ca7e6fe4653" FOREIGN KEY ("masterMemoriaJpnName") REFERENCES "master_memoria" ("jpn_name"), CONSTRAINT "FK_429326293eac1acdd0ccf29a740" FOREIGN KEY ("megucaId") REFERENCES "meguca" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_memoria"("id", "lbCount", "level", "masterMemoriaJpnName", "megucaId") SELECT "id", "lbCount", "level", "masterMemoriaJpnName", "megucaId" FROM "memoria"`);
        await queryRunner.query(`DROP TABLE "memoria"`);
        await queryRunner.query(`ALTER TABLE "temporary_memoria" RENAME TO "memoria"`);
        await queryRunner.query(`CREATE TABLE "temporary_meguca" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "support_type" integer NOT NULL, "bonus" integer, "level" integer NOT NULL DEFAULT (1), "magia_level" integer NOT NULL DEFAULT (1), "revision" integer NOT NULL DEFAULT (0), "slots" integer NOT NULL DEFAULT (0), "attack" integer NOT NULL DEFAULT (1), "defense" integer NOT NULL DEFAULT (1), "hp" integer NOT NULL DEFAULT (1), "masterMegucaJpnName" varchar, "userUserId" varchar, CONSTRAINT "FK_6fe036bf35443a0e06ce633e156" FOREIGN KEY ("masterMegucaJpnName") REFERENCES "master_meguca" ("jpn_name"), CONSTRAINT "FK_fe8ee1fd881dce4ba6db3d4a667" FOREIGN KEY ("userUserId") REFERENCES "magi_reco_user" ("user_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_meguca"("id", "support_type", "bonus", "level", "magia_level", "revision", "slots", "attack", "defense", "hp", "masterMegucaJpnName", "userUserId") SELECT "id", "support_type", "bonus", "level", "magia_level", "revision", "slots", "attack", "defense", "hp", "masterMegucaJpnName", "userUserId" FROM "meguca"`);
        await queryRunner.query(`DROP TABLE "meguca"`);
        await queryRunner.query(`ALTER TABLE "temporary_meguca" RENAME TO "meguca"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "meguca" RENAME TO "temporary_meguca"`);
        await queryRunner.query(`CREATE TABLE "meguca" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "support_type" integer NOT NULL, "bonus" integer, "level" integer NOT NULL DEFAULT (1), "magia_level" integer NOT NULL DEFAULT (1), "revision" integer NOT NULL DEFAULT (0), "slots" integer NOT NULL DEFAULT (0), "attack" integer NOT NULL DEFAULT (1), "defense" integer NOT NULL DEFAULT (1), "hp" integer NOT NULL DEFAULT (1), "masterMegucaJpnName" varchar, "userUserId" varchar)`);
        await queryRunner.query(`INSERT INTO "meguca"("id", "support_type", "bonus", "level", "magia_level", "revision", "slots", "attack", "defense", "hp", "masterMegucaJpnName", "userUserId") SELECT "id", "support_type", "bonus", "level", "magia_level", "revision", "slots", "attack", "defense", "hp", "masterMegucaJpnName", "userUserId" FROM "temporary_meguca"`);
        await queryRunner.query(`DROP TABLE "temporary_meguca"`);
        await queryRunner.query(`ALTER TABLE "memoria" RENAME TO "temporary_memoria"`);
        await queryRunner.query(`CREATE TABLE "memoria" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "lbCount" integer NOT NULL DEFAULT (0), "level" integer NOT NULL DEFAULT (1), "masterMemoriaJpnName" varchar, "megucaId" integer)`);
        await queryRunner.query(`INSERT INTO "memoria"("id", "lbCount", "level", "masterMemoriaJpnName", "megucaId") SELECT "id", "lbCount", "level", "masterMemoriaJpnName", "megucaId" FROM "temporary_memoria"`);
        await queryRunner.query(`DROP TABLE "temporary_memoria"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "magi_reco_user"`);
        await queryRunner.query(`DROP TABLE "meguca"`);
        await queryRunner.query(`DROP TABLE "memoria"`);
        await queryRunner.query(`DROP TABLE "master_memoria"`);
        await queryRunner.query(`DROP TABLE "master_meguca"`);
        await queryRunner.query(`DROP TABLE "guild"`);
        await queryRunner.query(`DROP TABLE "friend"`);
    }

}
