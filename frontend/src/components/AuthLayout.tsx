import Footer from '@/components/Footer'
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Achievers Hub</h1>
            <p className="text-xl font-light text-gray-900">powered by AZ Tech</p>
            <p className="text-gray-600 mt-2">Find the right person in the room, instantly.</p>
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AuthLayout;
