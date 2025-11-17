"use client"

import { useAuth, useSupabase } from "@/lib/auth-provider"
import { useEffect, useState } from "react"

type ExampleItem = {
  id: string | number
  name?: string | null
}

export function ExampleComponent() {
  const { user, userProfile, isAdmin, isLoading, signOut } = useAuth()
  const supabase = useSupabase()
  const [data, setData] = useState<ExampleItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const { data } = await supabase.from("tregu_listime").select("*").eq("user_id", user.id)

        setData(data || [])
      }
    }

    fetchData()
  }, [user, supabase])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {userProfile?.emri_i_plote}</h1>
      {isAdmin && <p>You are an admin!</p>}
      <button onClick={signOut}>Sign Out</button>
      {/* Use data from Supabase */}
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
