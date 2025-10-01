// src/collections/entities/collection.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'collections' })
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  // Notifier signature: URL/path or data URI
  @Column({ type: 'varchar', length: 500, nullable: true })
  notifierSignatureUrl: string;          // "firma de notificador"

  // Checkbox-like marks: store 'X' when checked; otherwise NULL
  @Column({ type: 'char', length: 1, nullable: true })
  nobodyPresent?: string;                 // "no habia nadie" -> 'X' or NULL

  @Column({ type: 'char', length: 1, nullable: true })
  wrongAddress?: string;                  // "dirección incorrecta" -> 'X' or NULL

  @Column({ type: 'char', length: 1, nullable: true })
  movedAddress?: string;                  // "cambio domicilio" -> 'X' or NULL

  @Column({ type: 'char', length: 1, nullable: true })
  refusedToSign?: string;                 // "no quiso firmar" -> 'X' or NULL

  @Column({ type: 'char', length: 1, nullable: true })
  notLocated?: string;                    // "no se localiza" -> 'X' or NULL

  @Column({ type: 'varchar', length: 300, nullable: true })
  other?: string;                         // "otro"
}
