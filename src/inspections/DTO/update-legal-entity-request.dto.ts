import { PartialType } from "@nestjs/mapped-types";
import { CreateLegalEntityRequestDto } from "./create-legal-entity-request.dto";

export class UpdateLegalEntityRequestDto extends PartialType(CreateLegalEntityRequestDto) {}
