import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.use(helmet());
  app.use(compression());

  const corsOrigins = config.get<string[]>('app.corsOrigins', []);
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(
    new RequestLoggingInterceptor(logger),
    new ResponseTransformInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('VyaparSetu API')
    .setDescription('AI-powered Indian government scheme finder for MSMEs and Startups')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .addTag('auth', 'Authentication')
    .addTag('users', 'User profile management')
    .addTag('businesses', 'Business profile management')
    .addTag('startups', 'Startup profile management')
    .addTag('schemes', 'Government scheme catalogue')
    .addTag('match', 'AI scheme matching')
    .addTag('compliance', 'AI compliance scoring')
    .addTag('documents', 'AI document generation')
    .addTag('pdf', 'PDF rendering')
    .addTag('applications', 'Application tracking')
    .addTag('regulatory-updates', 'Regulatory news and updates')
    .addTag('insights', 'Startup funding analytics')
    .addTag('health', 'Service health')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('app.port', 3000);
  await app.listen(port);
  logger.log?.(`VyaparSetu API running on http://localhost:${port}/api/v1`, 'Bootstrap');
  logger.log?.(`Swagger docs at http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
