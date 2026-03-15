import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { databaseConfig, generateMikroOrmOptions, validate } from "@config/index";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig], validate }),
        MikroOrmModule.forRootAsync({
            useFactory: (config: ConfigType<typeof databaseConfig>) => generateMikroOrmOptions(config),
            inject: [databaseConfig.KEY],
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
