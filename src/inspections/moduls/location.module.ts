import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationController } from "../Controllers/location.controller";
import { LocationService } from "../Services/location.service";
import { Module } from "@nestjs/common";
import { Location } from "../Entities/location.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}