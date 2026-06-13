import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './src/app.module';
import * as fs from 'fs';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VyaparSetu API')
    .setDescription('AI-powered Indian government scheme finder for MSMEs and Startups')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  fs.writeFileSync('swagger.json', JSON.stringify(document, null, 2));
  console.log('Swagger JSON generated successfully.');
  process.exit(0);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
