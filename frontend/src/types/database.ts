export interface Profile {
  id: string
  display_name: string | null
  title: string | null
  summary?: string | null
  superpower: string | null
  ask: string | null
  linkedin: string | null
  profile_image: string | null
  wants_meet: boolean
  created_at: string
  updated_at: string
}

export interface Connection {
  id: string
  user_id: string
  connection_id: string
  notes: string | null
  created_at: string
  updated_at: string
  profiles?: Profile // For joined data
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'summary'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      connections: {
        Row: Connection
        Insert: Omit<Connection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Connection, 'id' | 'user_id' | 'connection_id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
