/*
     As this is a generator, and not a static configuration, it may be better to move it somewhere else. 
     The config should have these information about e.g. migration directory path, but not the database credentials, 
     which should be provided at runtime with NestJS ConfigService.
     
*/

// TODO: do what is said in the comment above, and move this file somewhere else.

import { Migrator, TSMigrationGenerator } from "@mikro-orm/migrations";
import { MikroOrmModuleSyncOptions } from "@mikro-orm/nestjs";
import { ConnectionOptions, PostgreSqlDriver } from "@mikro-orm/postgresql";

type DatabaseCredentials = Pick<ConnectionOptions, "host" | "port" | "user" | "password" | "dbName">;

function generateMikroOrmOptions({
    host,
    port,
    password,
    user,
    dbName,
}: DatabaseCredentials): MikroOrmModuleSyncOptions {
    return {
        extensions: [Migrator],
        driver: PostgreSqlDriver,

        entities: ["dist/**/*.entity{.ts,.js}"],
        entitiesTs: ["src/**/*.entity{.ts,.js}"],

        host,
        port,
        user,
        password,
        dbName,

        // driverOptions: {
        //     connection: {
        //         ssl: db.cert ? { ca: db.cert } : false,
        //     },
        // },

        migrations: {
            path: "dist/migrations",
            pathTs: "src/database/migrations",
            generator: TSMigrationGenerator,
            disableForeignKeys: false,
        },
    };
}

export { generateMikroOrmOptions };
