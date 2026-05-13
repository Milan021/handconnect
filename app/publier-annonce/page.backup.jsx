'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import AnnonceForm from '../../components/AnnonceForm'

export default function PublierAnnonce() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      if (!profile || profile.user_type !== 'club') { setAccessDenied(true); setLoading(false); return }
      setUser({ ...authUser, ...profile })
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (<div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><div className="text-gray-400 text-lg">Chargement...</div></div>)
  }
  if (accessDenied) {
    return (<div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><div className="bg-[#1E293B] p-8 rounded-xl text-center max-w-md border border-gray-700"><div className="text-5xl mb-4">&#x1F6AB;</div><h2 className="text-xl font-bold text-white mb-2">Acces reserve aux clubs</h2><p className="text-gray-400 mb-6">Seuls les comptes de type Club peuvent publier des annonces.</p><button onClick={() => router.push('/')} className="px-6 py-3 bg-[#1D4ED8] text-white rounded-lg hover:bg-blue-700 transition">Retour a l accueil</button></div></div>)
  }
  return (
    <div className="min-h-screen bg-[#0B1120] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Publier une annonce</h1>
          <p className="text-gray-400">Trouvez le joueur ou l entraineur ideal pour votre club</p>
        </div>
        <div className="bg-[#1E293B] rounded-xl p-6 sm:p-8 border border-gray-700">
          <AnnonceForm user={user} />
        </div>
      </div>
    </div>
  )
}
