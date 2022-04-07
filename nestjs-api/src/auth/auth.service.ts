import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  signIn() {
    return { msg: 'Im signed in' }
  }

  signUp() {
    return { msg: 'Im signed up' }
  }
}
