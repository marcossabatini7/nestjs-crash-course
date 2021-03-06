import { Controller, Get, UseGuards } from '@nestjs/common'
import { User } from '@prisma/client'
import { GetUser } from '../auth/decorator/get-user.decorator'
import { JwtGuard } from '../auth/guard/jwt.guard'

@UseGuards(JwtGuard)
@Controller('api/users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    return user
  }
}
