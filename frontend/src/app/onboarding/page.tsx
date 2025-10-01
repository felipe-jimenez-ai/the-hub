'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import AuthLayout from '@/components/AuthLayout'
import ImageUpload from '@/components/ImageUpload'

type AccessCodeForm = {
  code: string
}

type SignupForm = {
  email: string
  password: string
  confirmPassword: string
}

type ProfileForm = {
  display_name: string
  title: string
  superpower: string
  ask: string
  linkedin: string
  profile_image: string
}

const STEPS = {
  ACCESS_CODE: 0,
  SIGNUP: 1,
  PROFILE: 2,
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(STEPS.ACCESS_CODE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  // Access code form
  const accessCodeForm = useForm<AccessCodeForm>()
  const correctCode = 'achievers-2025-2'

  // Signup form
  const signupForm = useForm<SignupForm>()

  // Profile form
  const profileForm = useForm<ProfileForm>()

  useEffect(() => {
    // If user is already authenticated and has completed profile, redirect to members
    if (user) {
      checkProfileCompletion()
    }
  }, [user])

  const checkProfileCompletion = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id)
        .single()

      if (data) {
        router.push('/members')
      } else {
        setCurrentStep(STEPS.PROFILE)
      }
    } catch (error) {
      // Profile not found, stay on profile step
      setCurrentStep(STEPS.PROFILE)
    }
  }

  const handleAccessCodeSubmit = async (data: AccessCodeForm) => {
    setLoading(true)
    setError(null)

    if (data.code === correctCode) {
      sessionStorage.setItem('accessCodeVerified', 'true')
      setCurrentStep(STEPS.SIGNUP)
    } else {
      setError('Invalid access code. Please try again.')
    }

    setLoading(false)
  }

  const handleSignupSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      setCurrentStep(STEPS.PROFILE)
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (data: ProfileForm) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          display_name: data.display_name,
          title: data.title,
          superpower: data.superpower,
          ask: data.ask,
          linkedin: data.linkedin,
          profile_image: data.profile_image
        })

      if (error) throw error

      router.push('/members')
    } catch (error: any) {
      setError(error.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    profileForm.setValue('profile_image', url)
  }

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[0, 1, 2].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step + 1}
            </div>
            {step < 2 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  step < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAccessCodeStep = () => (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Enter Access Code
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Please enter the access code to continue with onboarding
      </p>

      <form onSubmit={accessCodeForm.handleSubmit(handleAccessCodeSubmit)} className="space-y-4">
        <div>
          <label htmlFor="code" className="sr-only">
            Access Code
          </label>
          <input
            {...accessCodeForm.register('code', { required: 'Access code is required' })}
            id="code"
            type="text"
            className="relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 placeholder-gray-500"
            placeholder="Access Code"
          />
          {accessCodeForm.formState.errors.code && (
            <p className="mt-1 text-sm text-red-600">
              {accessCodeForm.formState.errors.code.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Continue'}
        </button>
      </form>
    </div>
  )

  const renderSignupStep = () => (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Create Your Account
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Sign up to join the Achievers Hub community
      </p>

      <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...signupForm.register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })}
            id="email"
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            placeholder="your@email.com"
          />
          {signupForm.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {signupForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...signupForm.register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            id="password"
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            placeholder="••••••••"
          />
          {signupForm.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {signupForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            {...signupForm.register('confirmPassword', {
              required: 'Please confirm your password'
            })}
            id="confirmPassword"
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            placeholder="••••••••"
          />
          {signupForm.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {signupForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  )

  const renderProfileStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Complete Your Profile
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Tell us about yourself to get the most out of Achievers Hub
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
        <ImageUpload
          onUpload={handleImageUpload}
          currentImage={profileForm.watch('profile_image')}
        />

        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
            Display Name *
          </label>
          <input
            {...profileForm.register('display_name', { required: 'Display name is required' })}
            id="display_name"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="How you'd like to be called"
          />
          {profileForm.formState.errors.display_name && (
            <p className="mt-1 text-sm text-red-600">
              {profileForm.formState.errors.display_name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Professional Title *
          </label>
          <input
            {...profileForm.register('title', { required: 'Professional title is required' })}
            id="title"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="e.g., Software Engineer, Product Manager"
          />
          {profileForm.formState.errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {profileForm.formState.errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="superpower" className="block text-sm font-medium text-gray-700">
            Your Superpower *
          </label>
          <textarea
            {...profileForm.register('superpower', { required: 'Superpower is required' })}
            id="superpower"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="What are you great at?"
          />
          {profileForm.formState.errors.superpower && (
            <p className="mt-1 text-sm text-red-600">
              {profileForm.formState.errors.superpower.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="ask" className="block text-sm font-medium text-gray-700">
            Your Kryptonite *
          </label>
          <textarea
            {...profileForm.register('ask', { required: 'This field is required' })}
            id="ask"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="What do you need help with?"
          />
          {profileForm.formState.errors.ask && (
            <p className="mt-1 text-sm text-red-600">
              {profileForm.formState.errors.ask.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
            LinkedIn Profile
          </label>
          <input
            {...profileForm.register('linkedin')}
            id="linkedin"
            type="url"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="https://www.linkedin.com/in/your-profile"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Saving Profile...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  )

  return (
    <AuthLayout>
      {renderStepIndicator()}

      {currentStep === STEPS.ACCESS_CODE && renderAccessCodeStep()}
      {currentStep === STEPS.SIGNUP && renderSignupStep()}
      {currentStep === STEPS.PROFILE && renderProfileStep()}
    </AuthLayout>
  )
}