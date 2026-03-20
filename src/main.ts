// ! TODO: This is potentially dangerous, as it will load all environment variables from the .env file into process.env, which can lead to security issues if not handled properly. Make sure to only include necessary environment variables in the .env file and avoid committing sensitive information to version control.
import "dotenv/config"; // <-- Must be before any module that reads process.env
import "tsconfig-paths/register"; // <-- Must be first import to work with tsconfig paths
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    const config = new DocumentBuilder().setVersion("1.0").build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, documentFactory);

    await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
