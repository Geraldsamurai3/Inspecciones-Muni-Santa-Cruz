// src/users/dto/update-user.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateGeneralInspectionDto } from "./create-general-inspection.dto";


export class UpdateGeneralInspectionDto extends PartialType(CreateGeneralInspectionDto) {}
