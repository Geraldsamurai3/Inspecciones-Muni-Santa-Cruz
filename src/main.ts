// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule }    from './app.module';
import { DataSource }   from 'typeorm';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv      from 'dotenv';

dotenv.config();

async function ensureDatabaseExists() {
  const tmpDs = new DataSource({
    type:     'mariadb',
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });
  await tmpDs.initialize();

  await tmpDs.query(`
    CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\`
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  await tmpDs.destroy();
}

async function bootstrap() {
  await ensureDatabaseExists();

  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE'],
    allowedHeaders: ['Content-Type','Authorization'],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}/`);
}

bootstrap();
