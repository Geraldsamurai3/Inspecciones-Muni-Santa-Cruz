import { PartialType } from "@nestjs/mapped-types";
import { CreateAntiquityDto } from "./create-antiquity.dto";


export class UpdateAniquityDto extends PartialType(CreateAntiquityDto) {}
