// src/collections/dto/create-collection.dto.ts
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

const MARK_REGEX = /^[Xx]$/; // only 'X' or 'x'

export class CreateCollectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notifierSignatureUrl?: string;

  // Send 'X' when checked; omit field when not checked
  @IsOptional() @IsString() @Matches(MARK_REGEX, { message: 'nobodyPresent must be "X" when provided' })
  nobodyPresent?: string;

  @IsOptional() @IsString() @Matches(MARK_REGEX, { message: 'wrongAddress must be "X" when provided' })
  wrongAddress?: string;

  @IsOptional() @IsString() @Matches(MARK_REGEX, { message: 'movedAddress must be "X" when provided' })
  movedAddress?: string;

  @IsOptional() @IsString() @Matches(MARK_REGEX, { message: 'refusedToSign must be "X" when provided' })
  refusedToSign?: string;

  @IsOptional() @IsString() @Matches(MARK_REGEX, { message: 'notLocated must be "X" when provided' })
  notLocated?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  other?: string;
}
