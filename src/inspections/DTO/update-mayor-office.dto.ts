import { PartialType } from "@nestjs/mapped-types";
import { CreateMayorOfficeDto } from "./create-mayor-office.dto";


export class UpdateMayorOfficeDto extends PartialType(CreateMayorOfficeDto) {}
