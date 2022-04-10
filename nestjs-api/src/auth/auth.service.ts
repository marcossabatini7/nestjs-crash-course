import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { hash as argonHash, verify as argonVerify } from 'argon2'

import { PrismaService } from '../prisma/prisma.service'
import { AuthDto } from './dto/auth.dto'

type AcessToken = {
  access_token: string
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async signIn(dto: AuthDto): Promise<AcessToken> {
    //  find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })
    //  if user does't exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect')
    }

    //  compare passwords
    const pswdMatches = await argonVerify(user.hash, dto.password)
    //  if password is incorrect throw exception
    if (!pswdMatches) {
      throw new ForbiddenException('Credentials incorrect')
    }

    return this.signToken(user.id, user.email)
  }

  async signUp(dto: AuthDto): Promise<AcessToken> {
    //  generate the password hash
    const hash = await argonHash(dto.password)

    try {
      //  save the new user in db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash
        }
      })

      return this.signToken(user.id, user.email)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        //  duplicate field error (email)
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken')
        }
      }
      throw error
    }
  }

  private async signToken(userId: number, email: string): Promise<AcessToken> {
    const payload = {
      sub: userId,
      email
    }
    const secret = this.config.get('JWT_SECRET')
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret
    })
    return { access_token: token }
  }
}
