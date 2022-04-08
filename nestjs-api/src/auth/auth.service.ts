import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthDto } from './dto/auth.dto'
import { hash as argonHash, verify as argonVerify } from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signIn(dto: AuthDto) {
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

    delete user.hash
    //  send back the user
    return user
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
