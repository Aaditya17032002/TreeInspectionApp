'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../components/ui/use-toast"
import Image from "next/image"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { loginRequest } from "../../lib/msal-config"
import React from "react"
import { Scale } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Handle any redirect promise when the page loads
        await instance.handleRedirectPromise()
        
        // Check if we're authenticated after handling redirect
        if (isAuthenticated) {
          localStorage.setItem("isLoggedIn", "true")
          router.push("/")
        }
      } catch (error) {
        console.error('Redirect handling error:', error)
      }
    }

    handleRedirect()
  }, [instance, isAuthenticated, router])

  const handleLogin = async () => {
    setLoading(true)

    try {
      // Try popup first
      const response = await instance.loginPopup(loginRequest)
      if (response) {
        localStorage.setItem("isLoggedIn", "true")
        router.push("/")
      }
    } catch (error) {
      console.error('Popup login failed, trying redirect...', error)
      
      // If popup fails, try redirect
      try {
        await instance.loginRedirect(loginRequest)
      } catch (redirectError) {
        console.error('Login redirect error:', redirectError)
        toast({
          title: "Login Failed",
          description: "An error occurred during login. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Scale className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Tree Inspection App
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your Microsoft account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700" 
            onClick={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in with Microsoft"
            )}
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-gray-600">
            Use your organization's Microsoft account to log in
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

