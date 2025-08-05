import { PartialType } from "@nestjs/mapped-types";
import { CreatePcCancellationDto } from "./create-pc-cancellation.dto";


export class UpdatePcCancellationDto extends PartialType(CreatePcCancellationDto) {}
