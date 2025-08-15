'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = useCallback(
    async (email: string, password: string, callbackUrl?: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok && !result?.error) {
        router.push(callbackUrl || '/dashboard')
        router.refresh()
        return { success: true }
      }

      return {
        success: false,
        error: result?.error || 'Authentication failed',
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push('/')
    router.refresh()
  }, [router])

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const user = session?.user || null

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}