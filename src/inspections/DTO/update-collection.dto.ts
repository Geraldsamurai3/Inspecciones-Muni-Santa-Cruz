// src/collections/dto/update-collection.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCollectionDto } from './create-collection.dto';

export class UpdateCollectionDto extends PartialType(CreateCollectionDto) {}
