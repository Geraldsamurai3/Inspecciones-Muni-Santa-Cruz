import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkReceiptDto } from './create-work-receipts.dto';

export class UpdateWorkReceiptDto extends PartialType(CreateWorkReceiptDto) {}
