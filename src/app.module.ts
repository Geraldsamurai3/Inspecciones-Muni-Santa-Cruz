// src/app.module.ts
import { Module }                   from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule }            from '@nestjs/typeorm';
import { EventEmitterModule }       from '@nestjs/event-emitter';
import { AppController }            from './app.controller';
import { AppService }               from './app.service';
import { AuthModule }               from './auth/auth.module';
import { UsersModule }              from './users/users.module';
import { CloudinaryModule }         from './cloudinary/cloudinary.module';
import { EmailModule }              from './email/email.module';
import { DashboardModule }          from './dashboard/dashboard.module';
import { InspectionsModule } from './inspections/inspections.module';
import { WorkAntiquityAttentionsModule } from './SpecialInspection/Modules/work-antiquity-attentions.module';
import { ConstructionPermitCancellationReportsModule } from './SpecialInspection/Modules/construction-permit-cancellation-reports.module';
import { PropertyXxxVerificationsModule } from './SpecialInspection/Modules/property-xxx-verifications.module';
import { LiquorLicenseComplaintsModule } from './SpecialInspection/Modules/liquor-license-complaints.module';
import { FarmInspectionRequestsModule } from './SpecialInspection/Modules/farm-inspection-requests.module';
import { ClosureInspectionReportsModule } from './SpecialInspection/Modules/closure-inspection-reports.module';
import { CfiaResignationAttentionsModule } from './SpecialInspection/Modules/cfia-resignation-attentions.module';
import { LandUseAttentionsModule } from './SpecialInspection/Modules/land-use-attentions.module';
import { WorkInspectionReportsModule } from './SpecialInspection/Modules/work-inspection-reports.module';

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

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    InspectionsModule,
    CloudinaryModule,
    EmailModule,
    DashboardModule,
    WorkAntiquityAttentionsModule,
    ConstructionPermitCancellationReportsModule,
    PropertyXxxVerificationsModule,
    LiquorLicenseComplaintsModule,
    FarmInspectionRequestsModule,
    ClosureInspectionReportsModule,
    CfiaResignationAttentionsModule,
    LandUseAttentionsModule,
     WorkInspectionReportsModule
     
    

   
  ],
  controllers: [AppController],
  providers: [
    AppService,
   
  ],
})
export class AppModule {}
