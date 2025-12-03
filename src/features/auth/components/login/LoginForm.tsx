'use client'

import { LoginBranding } from './LoginBranding'
import { LoginHeader } from './LoginHeader'
import { LoginFooter } from './LoginFooter'
import { GoogleButton } from './GoogleButton'

export function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-5xl h-[75vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex">
        <LoginBranding />

        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <LoginHeader />
            <GoogleButton />
            <LoginFooter />
          </div>
        </div>
      </div>
    </div>
  )
}
