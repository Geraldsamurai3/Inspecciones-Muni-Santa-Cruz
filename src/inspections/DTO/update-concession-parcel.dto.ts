import { PartialType } from '@nestjs/mapped-types';
import { CreateConcessionParcelDto } from './create-concession-parcel.dto';

export class UpdateConcessionParcelDto extends PartialType(CreateConcessionParcelDto) {}
