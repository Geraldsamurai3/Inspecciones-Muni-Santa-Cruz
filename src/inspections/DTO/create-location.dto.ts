import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { District } from '../Enums/district.enum';

/** Helper para mapear variantes del frontend a valores del enum District */
function mapDistrictToEnum(value: any): District {
  if (!value) return District.SantaCruz; // fallback por defecto
  
  const s = String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  
  // Mapeo de variantes comunes
  if (s.includes('santa') && s.includes('cruz')) return District.SantaCruz;
  if (s.includes('bolson')) return District.Bolson;
  if (s.includes('27') || s.includes('abril') || s.includes('veintisiete')) return District.VeintisieteAbril;
  if (s.includes('tempate')) return District.Tempate;
  if (s.includes('cartagena')) return District.Cartagena;
  if (s.includes('cuajiniquil')) return District.Cuajiniquil;
  if (s.includes('diria')) return District.Diriá;
  if (s.includes('cabovelas') || s.includes('cabo') || s.includes('velas')) return District.Cabovelas;
  if (s.includes('tamarindo')) return District.Tamarindo;
  
  // Si es un número, mapear por índice (caso común en frontends)
  const num = parseInt(s);
  if (!isNaN(num)) {
    const districts = Object.values(District);
    if (num >= 0 && num < districts.length) {
      return districts[num] as District;
    }
  }
  
  // Fallback: intentar matchear directamente con el enum
  const enumValues = Object.values(District);
  const match = enumValues.find(d => 
    d.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === s
  );
  
  return match || District.SantaCruz; // fallback por defecto
}

export class CreateLocationDto {
  @Transform(({ value }) => mapDistrictToEnum(value))
  @IsEnum(District, { message: 'District must be a valid value from the enum' })
  @IsNotEmpty({ message: 'District is required' })
  district: District;

  @IsString({ message: 'Exact address must be a string' })
  @IsNotEmpty({ message: 'Exact address is required' })
  exactAddress: string;
}
