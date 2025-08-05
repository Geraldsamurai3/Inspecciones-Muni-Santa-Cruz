// src/users/dto/update-user.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateIndividualRequestDto } from "./create-individual-request.dto";

export class UpdateIndividualRequestDto extends PartialType(CreateIndividualRequestDto) {}
