// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy }  from 'passport-jwt'
import { ConfigService }         from '@nestjs/config'
import { UsersService }          from '../users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly cs: ConfigService,
    private readonly usersService: UsersService,    // <-- inyectamos UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:    cs.get<string>('JWT_SECRET'),
    })
  }

  // Al validar el payload (ya descifrado), vamos a buscar al usuario en la BD
  async validate(payload: any) {
    // payload.sub contiene el id de usuario
    const user = await this.usersService.findOne(payload.sub)
    // quitamos la contraseña antes de inyectar en req.user
    const { passwordHash, resetToken, resetTokenExpires, ...safe } = user
    return safe
  }
}
