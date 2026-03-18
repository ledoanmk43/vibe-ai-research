import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(4000),
        API_PREFIX: Joi.string().default('api/v1'),

        DB_HOST: Joi.string().optional(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().optional(),
        DB_PASSWORD: Joi.string().optional(),
        DB_NAME: Joi.string().optional(),
        DATABASE_URL: Joi.string().optional(),
        DB_SSL: Joi.boolean().default(false),
        DB_SYNCHRONIZE: Joi.boolean().default(true),
        DB_LOGGING: Joi.boolean().default(false),

        FIREBASE_PROJECT_ID: Joi.string().optional().allow(''),
        FIREBASE_CLIENT_EMAIL: Joi.string().optional().allow(''),
        FIREBASE_PRIVATE_KEY: Joi.string().optional().allow(''),

        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
      }),
    }),
  ],
})
export class AppConfigModule {}
