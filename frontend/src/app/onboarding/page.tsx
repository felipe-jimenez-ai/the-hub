'use client';

import React, { useState, useEffect } from 'react';
import ProfileCard from '../../components/ProfileCard';
import { Profile } from '@/types/database'; // Assuming Profile type is defined here
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AuthLayout from '../../components/AuthLayout'; // Import AuthLayout

const OnboardingPage = () => {
  const [fullName, setFullName] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [canHelpWith, setCanHelpWith] = useState('');
  const [isLookingFor, setIsLookingFor] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.user_metadata) {
      if (user.user_metadata.full_name) {
        setFullName(user.user_metadata.full_name as string);
      }
      if (user.user_metadata.job_title) {
        setTitleRole(user.user_metadata.job_title as string);
      }
      // You might also try to pre-fill linkedinUrl if available from metadata
      if (user.user_metadata.linkedin_url) {
        setLinkedinUrl(user.user_metadata.linkedin_url as string);
      }
    }
  }, [user]);

  // const handleLinkedInSignIn = async () => { // Removed handleLinkedInSignIn function
  //   setIsLoading(true);
  //   try {
  //     const { error } = await supabase.auth.signInWithOAuth({
  //       provider: 'linkedin_oidc',
  //       options: {
  //         redirectTo: `${window.location.origin}/access`,
  //       },
  //     });
  //     if (error) throw error;
  //   } catch (error: any) {
  //     console.error('Error signing in with LinkedIn:', error);
  //     alert(`Error signing in with LinkedIn: ${error.message}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      alert('You must be logged in to create a profile.');
      setIsLoading(false);
      router.push('/auth/login'); // Redirect to login if not authenticated
      return;
    }

    const newErrors: { [key: string]: string } = {};
    if (!fullName) newErrors.fullName = 'Full Name is required.';
    if (!titleRole) newErrors.titleRole = 'Title / Role is required.';
    if (!canHelpWith) newErrors.canHelpWith = '"Can Help With" field is required.';
    if (!isLookingFor) newErrors.isLookingFor = '"Looking For" field is required.';
    if (!linkedinUrl) newErrors.linkedinUrl = 'LinkedIn Profile URL is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    setErrors({}); // Clear any previous errors

    let publicImageUrl: string | null = null;
    if (selectedImage && user) {
      setIsLoading(true);
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `profile_images/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars') // Assuming 'avatars' is your storage bucket
          .upload(filePath, selectedImage, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        publicImageUrl = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath).data.publicUrl;
      } catch (error: any) {
        console.error('Error uploading image:', error);
        alert(`Error uploading profile image: ${error.message}`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase.from('profiles').insert({
        display_name: fullName,
        title: titleRole,
        superpower: canHelpWith, // Map 'canHelpWith' to 'superpower'
        ask: isLookingFor, // Map 'isLookingFor' to 'ask'
        linkedin: linkedinUrl || null,
        // Add other required fields with default/placeholder values
        id: user.id, // Use the authenticated user's ID
        profile_image: publicImageUrl, // Use the uploaded image URL
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setProfileImageUrl(URL.createObjectURL(file)); // Create a temporary URL for preview
    } else {
      setSelectedImage(null);
      setProfileImageUrl(null);
    }
  };

  // Create a dummy profile for live preview
  const previewProfile: Profile = {
    id: 'preview-id', // Placeholder ID
    display_name: fullName || 'Your Name',
    title: titleRole || 'Your Title / Role',
    summary: null, // Explicitly set to null to satisfy linter
    superpower: canHelpWith || 'What you can help with...',
    ask: isLookingFor || 'What you are looking for...',
    linkedin: linkedinUrl || null,
    profile_image: profileImageUrl, // Use the temporary URL for preview
    wants_meet: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <AuthLayout contentMaxWidthClass="max-w-4xl"> {/* Set a wider max-width for onboarding content */}
      {/* <h1 className="text-4xl font-bold mb-8">The Hub</h1> */}
      <p className="text-xl font-semibold text-green-600 mb-6 flex items-center space-x-2 justify-center"> {/* Adjusted margin-bottom and added justify-center */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        <span>+15 profiles created in the last 10 minutes</span>
      </p>
      <div className="w-1/2 h-2 bg-green-500 rounded-full mb-6 mx-auto"></div> {/* Progress Indicator, changed to w-1/2 and moved outside form */}

      <div className="flex flex-col lg:flex-row items-start lg:space-x-8 w-full"> {/* Changed to items-start and removed justify-center */}
        <form onSubmit={handleOnboardingSubmit} className="flex flex-col items-center w-full lg:w-1/2"> {/* Form takes half width on larger screens */}
          <div className="relative w-24 h-24 mb-2 group"> {/* Reduced mb-6 to mb-2 */}
            <input
              type="file"
              id="form-avatar-upload"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
              className="hidden"
            />
            <label htmlFor="form-avatar-upload" className={`cursor-pointer block w-full h-full rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center ${isLoading ? 'pointer-events-none' : ''}`}>
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImageUrl} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-700" fill="currentColor" viewBox="0 0 20 20"> {/* Adjusted to text-gray-700 */}
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          </div>
          <p className="text-blue-600 text-sm mb-6 cursor-pointer" onClick={() => document.getElementById('form-avatar-upload')?.click()}>Change Photo</p> {/* Added Change Photo text */}

          {/* Full Name Field */}
          <div className="w-full mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1">
              <input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`} style={{ color: '#1A202C' }} // Explicitly set dark gray color
                disabled={isLoading}
                required
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Title / Role Field */}
          <div className="w-full mb-4">
            <label htmlFor="titleRole" className="block text-sm font-medium text-gray-700">
              Title / Role
            </label>
            <div className="mt-1">
              <input
                id="titleRole"
                type="text"
                placeholder="e.g., Software Engineer, CEO, Founder"
                value={titleRole}
                onChange={(e) => setTitleRole(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${errors.titleRole ? 'border-red-500 focus:ring-red-500' : ''}`} style={{ color: '#1A202C' }} // Explicitly set dark gray color
                disabled={isLoading}
                required
              />
            </div>
            {errors.titleRole && <p className="text-red-500 text-sm mt-1">{errors.titleRole}</p>}
          </div>

          {/* Can Help With Field */}
          <div className="w-full mb-4">
            <label htmlFor="canHelpWith" className="block text-sm font-medium text-gray-700">
              Can Help With
            </label>
            <div className="mt-1">
              <textarea
                id="canHelpWith"
                placeholder="e.g., Python, fundraising, UX design"
                value={canHelpWith}
                onChange={(e) => setCanHelpWith(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px] text-gray-900 bg-white ${errors.canHelpWith ? 'border-red-500 focus:ring-red-500' : ''}`} style={{ color: '#1A202C' }} // Explicitly set dark gray color
                disabled={isLoading}
                required
              />
            </div>
            {errors.canHelpWith && <p className="text-red-500 text-sm mt-1">{errors.canHelpWith}</p>}
          </div>

          {/* Looking For Field */}
          <div className="w-full mb-4">
            <label htmlFor="isLookingFor" className="block text-sm font-medium text-gray-700">
              Looking For
            </label>
            <div className="mt-1">
              <textarea
                id="isLookingFor"
                placeholder="e.g., co-founder, marketing, researcher"
                value={isLookingFor}
                onChange={(e) => setIsLookingFor(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px] text-gray-900 bg-white ${errors.isLookingFor ? 'border-red-500 focus:ring-red-500' : ''}`} style={{ color: '#1A202C' }} // Explicitly set dark gray color
                disabled={isLoading}
                required
              />
            </div>
            {errors.isLookingFor && <p className="text-red-500 text-sm mt-1">{errors.isLookingFor}</p>}
          </div>

          {/* LinkedIn Profile URL Field */}
          <div className="w-full mb-6"> {/* Adjusted margin-bottom for last field */}
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
              LinkedIn Profile URL
            </label>
            <div className="mt-1">
              <input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${errors.linkedinUrl ? 'border-red-500 focus:ring-red-500' : ''}`} style={{ color: '#1A202C' }} // Explicitly set dark gray color
                disabled={isLoading}
                required
              />
            </div>
            {errors.linkedinUrl && <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>}
          </div>
        </form>

        <div className="mt-8 w-full max-w-md mx-auto"> {/* Added mx-auto for centering on mobile */}
          <h2 className="text-2xl font-bold mb-4 text-center text-black">Your New Profile</h2> {/* Increased contrast */}
          <ProfileCard profile={previewProfile} />
        </div>
      </div>
      <div className="w-full max-w-md flex justify-center mt-8 mx-auto"> {/* Added mx-auto */}
        <button
          type="submit"
          onClick={handleOnboardingSubmit} // Attach the submit handler here
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-200 transform hover:scale-105"
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
            'Make me Visible'
          )}
        </button>
      </div>
    </AuthLayout> // Close AuthLayout
  );
};

export default OnboardingPage;
