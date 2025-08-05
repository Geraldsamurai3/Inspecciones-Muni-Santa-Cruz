import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Construction } from '../Entities/construction.entity';
import { ConstructionService } from '../Services/construction.service';
import { ConstructionController } from '../Controllers/construction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Construction])],
  controllers: [ConstructionController],
  providers: [ConstructionService],
})
export class ConstructionModule {}
