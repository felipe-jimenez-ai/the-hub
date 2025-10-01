'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import ProfileCard from '@/components/ProfileCard'
import withAuth from '@/components/withAuth' // This line should be present
import type { Profile } from '@/types/database'

function MembersPage() { // <--- NO 'export' keyword here
  const { user } = useAuth()
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [connections, setConnections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [meetLoading, setMeetLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500) // 500ms delay

  const loadProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }, [supabase, user?.id])

  const loadConnections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('connection_id')
        .eq('user_id', user?.id)

      if (error) throw error
      setConnections(data?.map(conn => conn.connection_id) || [])
    } catch (error) {
      console.error('Error loading connections:', error)
    }
  }, [supabase, user?.id])

  useEffect(() => {
    loadProfiles()
    loadUserProfile()
    loadConnections()
  }, [loadProfiles, loadUserProfile, loadConnections])

  const handleMeetOptIn = async () => {
    if (!user || meetLoading) return

    setMeetLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wants_meet: !userProfile?.wants_meet })
        .eq('id', user.id)

      if (error) throw error

      setUserProfile(prev => prev ? { ...prev, wants_meet: !prev.wants_meet } : null)
    } catch (error) {
      console.error('Error updating meet preference:', error)
      alert('Failed to update meet preference. Please try again.')
    } finally {
      setMeetLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Members</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Filter out profiles that don't have required fields completed
  const completedProfiles = profiles.filter(profile => 
    profile.display_name && profile.title && profile.superpower && profile.ask
  )

  return (
    <div>
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Members</h1>
        
        {userProfile && userProfile.display_name && (
          <button
            onClick={handleMeetOptIn}
            disabled={meetLoading}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              userProfile.wants_meet
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            {meetLoading 
              ? 'Updating...' 
              : userProfile.wants_meet 
                ? 'Opted in for Meet ✓' 
                : 'Opt-in for this week\'s Meet'
            }
          </button>
        )}
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, superpower, or kryptonite..."
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 sm:text-sm"
        />
      </div>

      {!userProfile?.display_name && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Complete your profile first
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Please complete your profile to appear in the members directory and access all features.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <a
                    href="/profile/edit"
                    className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                  >
                    Complete Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {completedProfiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No members have completed their profiles yet.</p>
          <p className="text-gray-500 mt-2">Be the first to complete yours!</p>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            {completedProfiles.length} member{completedProfiles.length !== 1 ? 's' : ''} in your
            <div className="flex flex-col md:flex-row md:items-center">
              <span className="font-bold text-lg md:text-xl"> Achievers Hub</span>
              <span className="font-light text-sm md:text-xl md:ml-1"> powered by AZ Tech</span>
            </div>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProfiles
              .filter((profile) => {
                if (!debouncedSearchTerm.trim()) return true;
                
                const search = debouncedSearchTerm.toLowerCase();
                return (
                  (profile.display_name?.toLowerCase() || '').includes(search) ||
                  (profile.title?.toLowerCase() || '').includes(search) ||
                  (profile.superpower?.toLowerCase() || '').includes(search) ||
                  (profile.ask?.toLowerCase() || '').includes(search)
                );
              })
              .map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isRemembered={connections.includes(profile.id)}
                onConnectionSaved={() => {
                  loadProfiles()
                  loadConnections()
                }}
              />
            ))}
            {completedProfiles.filter((profile) => {
              if (!debouncedSearchTerm.trim()) return true;
              
              const search = debouncedSearchTerm.toLowerCase();
              return (
                (profile.display_name?.toLowerCase() || '').includes(search) ||
                (profile.title?.toLowerCase() || '').includes(search) ||
                (profile.superpower?.toLowerCase() || '').includes(search) ||
                (profile.ask?.toLowerCase() || '').includes(search)
              );
            }).length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-gray-500 text-center">No members found. Try searching for a different skill or name.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const WrappedMembersPage = withAuth(MembersPage); // <--- New line
export default WrappedMembersPage; // <--- This should be the default export