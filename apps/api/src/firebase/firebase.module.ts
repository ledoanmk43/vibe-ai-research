import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (config: ConfigService): App => {
        if (getApps().length > 0) {
          return getApps()[0] as App
        }

        const projectId = config.get<string>('FIREBASE_PROJECT_ID')
        const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL')
        const privateKey = config.get<string>('FIREBASE_PRIVATE_KEY')?.replaceAll('\\n', '\n')

        if (projectId && clientEmail && privateKey) {
          return initializeApp({
            credential: cert({ projectId, clientEmail, privateKey })
          })
        }

        console.warn(
          '⚠️  Firebase Admin: missing credentials. Auth guards will reject all requests.'
        )
        return initializeApp() // no-op app for local dev
      }
    }
  ],
  exports: ['FIREBASE_ADMIN']
})
export class FirebaseModule {}
