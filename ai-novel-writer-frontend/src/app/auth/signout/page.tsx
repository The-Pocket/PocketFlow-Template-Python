'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto sign out after 3 seconds
    const timer = setTimeout(() => {
      handleSignOut()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
    })
    router.push('/')
    router.refresh()
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign Out</CardTitle>
          <CardDescription className="text-center">
            Are you sure you want to sign out of your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>You will be automatically signed out in a few seconds...</p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSignOut} className="flex-1">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sign Out Now
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}