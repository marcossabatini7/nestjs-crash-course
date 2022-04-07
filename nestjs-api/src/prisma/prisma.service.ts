import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'ostgresql://admin:podman@localhost:5432/nestjs_bookmark?schema=public'
        }
      }
    })
  }
}
