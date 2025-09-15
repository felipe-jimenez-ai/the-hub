'use client';

import React, { useState } from 'react';
import ProfileCard from '../../components/ProfileCard';

const OnboardingPage = () => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newProfile, setNewProfile] = useState<any>(null); // State to hold the new profile data

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNewProfile(null); // Clear previous profile data on new submission

    try {
      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl: linkedinUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      const formattedData = {
        ...data,
        canHelpWith: data.canHelpWith || [],
        isLookingFor: data.isLookingFor || [],
      };
      setNewProfile(formattedData); // Store the formatted profile data
    } catch (error: any) {
      alert(`Failed to create profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Join The Hub</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="text"
          placeholder="Paste Your LinkedIn Profile URL"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="w-96 p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="w-96 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            'Create My Profile'
          )}
        </button>
      </form>

      {newProfile && (
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Your New Profile</h2>
          <ProfileCard profile={newProfile} />
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
