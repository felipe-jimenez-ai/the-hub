'use client';

import React, { useState } from 'react';
import ProfileCard from '../../components/ProfileCard';
import { Profile } from '@/types/database'; // Assuming Profile type is defined here
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const OnboardingPage = () => {
  const [fullName, setFullName] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [canHelpWith, setCanHelpWith] = useState('');
  const [isLookingFor, setIsLookingFor] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [about, setAbout] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      alert('You must be logged in to create a profile.');
      setIsLoading(false);
      router.push('/auth/login'); // Redirect to login if not authenticated
      return;
    }

    try {
      const { data, error } = await supabase.from('profiles').insert({
        display_name: fullName,
        title: titleRole,
        summary: about,
        superpower: canHelpWith, // Map 'canHelpWith' to 'superpower'
        ask: isLookingFor, // Map 'isLookingFor' to 'ask'
        linkedin: linkedinUrl || null,
        // Add other required fields with default/placeholder values
        id: user.id, // Use the authenticated user's ID
        profile_image: null,
        wants_meet: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      alert('Profile created successfully!');
      router.push('/access');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      alert(`Failed to create profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a dummy profile for live preview
  const previewProfile: Profile = {
    id: 'preview-id', // Placeholder ID
    display_name: fullName || 'Your Name',
    title: titleRole || 'Your Title / Role',
    summary: about || 'A brief description about yourself...',
    superpower: canHelpWith || 'What you can help with...',
    ask: isLookingFor || 'What you are looking for...',
    linkedin: linkedinUrl || null,
    profile_image: null,
    wants_meet: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">The Hub</h1>
      <div className="flex flex-col lg:flex-row items-center justify-center lg:space-x-8 w-full max-w-5xl">
        <form onSubmit={handleOnboardingSubmit} className="flex flex-col items-center w-full max-w-md">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          />
          <input
            type="text"
            placeholder="Title / Role"
            value={titleRole}
            onChange={(e) => setTitleRole(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          />
          <textarea
            placeholder="About (e.g., your professional summary)"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            disabled={isLoading}
            required
          />
          <textarea
            placeholder="I can help with..."
            value={canHelpWith}
            onChange={(e) => setCanHelpWith(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            disabled={isLoading}
            required
          />
          <textarea
            placeholder="I'm looking for..."
            value={isLookingFor}
            onChange={(e) => setIsLookingFor(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            disabled={isLoading}
            required
          />
          <input
            type="text"
            placeholder="LinkedIn Profile URL"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          />
        </form>

        <div className="mt-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Your New Profile</h2>
          <ProfileCard profile={previewProfile} />
        </div>
      </div>
      <div className="w-full max-w-md flex justify-center mt-8">
        <button
          type="submit"
          onClick={handleOnboardingSubmit} // Attach the submit handler here
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-200"
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
            'Join The Hub'
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
