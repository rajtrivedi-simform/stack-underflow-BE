import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logDir = config.get<string>('logging.dir', './logs');
        const logLevel = config.get<string>('logging.level', 'info');
        const nodeEnv = config.get<string>('app.nodeEnv', 'development');

        const transports: winston.transport[] = [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                const ctx = context ? `[${context}]` : '';
                const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
              }),
            ),
          }),
        ];

        if (nodeEnv === 'production') {
          transports.push(
            new (winston.transports as any).DailyRotateFile({
              dirname: logDir,
              filename: 'vyaparsetu-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
              level: logLevel,
              format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }),
            new (winston.transports as any).DailyRotateFile({
              dirname: logDir,
              filename: 'vyaparsetu-error-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '30d',
              level: 'error',
              format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }),
          );
        }

        return { level: logLevel, transports };
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
