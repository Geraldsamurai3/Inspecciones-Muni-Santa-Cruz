// src/app.module.ts
import { Module }                   from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule }            from '@nestjs/typeorm';
import { EventEmitterModule }       from '@nestjs/event-emitter';
import { ScheduleModule }           from '@nestjs/schedule';
import { APP_GUARD }                from '@nestjs/core';
import { AppController }            from './app.controller';
import { AppService }               from './app.service';
import { AuthModule }               from './auth/auth.module';
import { UsersModule }              from './users/users.module';
import { CloudinaryModule }         from './cloudinary/cloudinary.module';
import { EmailModule }              from './email/email.module';
import { DashboardModule }          from './dashboard/dashboard.module';
import { StatsModule }              from './stats/stats.module';
import { InspectionsModule } from './inspections/inspections.module';
import { ReportsModule } from './reports/reports.module';
import { JwtAuthGuard }             from './auth/guards/jwt-auth.guard';

@Module({ 
  imports: [
    // Carga global de .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MariaDB con TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type: 'mariadb',
        host: cs.get<string>('DB_HOST'),
        port: cs.get<number>('DB_PORT'),
        username: cs.get<string>('DB_USERNAME'),
        password: cs.get<string>('DB_PASSWORD'),
        database: cs.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: cs.get<boolean>('TYPEORM_SYNC', false),
        autoLoadEntities: true,
      }),
    }),

    // Event Emitter global
    EventEmitterModule.forRoot(),

    // Schedule Module para tareas cron
    ScheduleModule.forRoot(),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    InspectionsModule,
    CloudinaryModule,
    EmailModule,
    DashboardModule,
    StatsModule,
    ReportsModule
     
    

   
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global: aplica JwtAuthGuard a todas las rutas excepto las marcadas con @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
