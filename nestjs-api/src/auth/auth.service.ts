import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthDto } from './dto/auth.dto'
import { hash as argonHash } from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signIn() {
    return { msg: 'Im signed in' }
  }

  async signUp(dto: AuthDto) {
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

      delete user.hash

      //  return the new user
      return user
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
}
