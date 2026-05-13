'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const POSITIONS = [
  { value: 'gardien', label: 'Gardien' },
  { value: 'ailier_gauche', label: 'Ailier gauche' },
  { value: 'arriere_gauche', label: 'Arrière gauche' },
  { value: 'demi_centre', label: 'Demi-centre' },
  { value: 'pivot', label: 'Pivot' },
  { value: 'arriere_droit', label: 'Arrière droit' },
  { value: 'ailier_droit', label: 'Ailier droit' },
]

const DIVISIONS = [
  { value: 'departemental', label: 'Départemental' },
  { value: 'regional', label: 'Régional' },
  { value: 'pre_nationale', label: 'Pré-Nationale' },
  { value: 'n3', label: 'Nationale 3' },
  { value: 'n2', label: 'Nationale 2' },
  { value: 'n1', label: 'Nationale 1' },
  { value: 'proligue', label: 'Proligue' },
  { value: 'starligue', label: 'Starligue' },
  { value: 'd2f', label: 'D2 Féminine' },
  { value: 'd1f', label: 'D1 Féminine' },
]

export default function AnnonceForm({ user }) {
  const [formData, setFormData] = useState({
    type: 'player',
    title: '',
    club_name: '',
    division: '',
    city: '',
    position: '',
    description: '',
    is_urgent: false,
    salary_range: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData((p) => ({ ...p, [field]: val }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.club_name.trim() || !formData.description.trim()) {
      setError('Titre, club et description sont obligatoires.')
      return
    }
    setLoading(true)
    try {
      const { error: dbErr } = await supabase.from('annonces').insert({
        type: formData.type,
        title: formData.title.trim(),
        club_name: formData.club_name.trim(),
        division: formData.division,
        city: formData.city.trim(),
        position: formData.type === 'player' ? formData.position || null : null,
        description: formData.description.trim(),
        is_urgent: formData.is_urgent,
        benefits: [],
        salary_range: formData.salary_range.trim() || null,
        author_id: user.id,
        candidatures_count: 0,
      })
      if (dbErr) throw dbErr
      router.push('/?success=published')
    } catch (err) {
      console.error('Erreur publication:', err)
      setError(err.message || 'Erreur lors de la publication')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full p-3 border border-gray-600 bg-[#0B1120] text-white rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] outline-none placeholder-gray-500'
  const labelClass = 'block text-sm font-semibold text-gray-300 mb-1'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
      {error && (
        <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div>
        <label className={labelClass}>Type d&apos;annonce</label>
        <select value={formData.type} onChange={set('type')} className={inputClass} required>
          <option value="player">Recherche joueur</option>
          <option value="trainer">Recherche entraîneur</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Titre de l&apos;annonce *</label>
        <input
          type="text"
          value={formData.title}
          onChange={set('title')}
          placeholder="Ex : Recherche pivot confirmé pour montée en R1"
          maxLength={120}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Nom du club *</label>
        <input
          type="text"
          value={formData.club_name}
          onChange={set('club_name')}
          placeholder="Ex : HBC Villeurbanne"
          className={inputClass}
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Division</label>
          <select value={formData.division} onChange={set('division')} className={inputClass}>
            <option value="">— Sélectionner —</option>
            {DIVISIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ville</label>
          <input
            type="text"
            value={formData.city}
            onChange={set('city')}
            placeholder="Lyon"
            className={inputClass}
          />
        </div>
      </div>
      {formData.type === 'player' && (
        <div>
          <label className={labelClass}>Poste recherché</label>
          <select value={formData.position} onChange={set('position')} className={inputClass}>
            <option value="">— Sélectionner —</option>
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          value={formData.description}
          onChange={set('description')}
          rows="5"
          maxLength={1500}
          placeholder="Décrivez le profil recherché, l'ambiance du club, les objectifs..."
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Rémunération / avantages</label>
        <input
          type="text"
          value={formData.salary_range}
          onChange={set('salary_range')}
          placeholder="Ex : 200-400 €/mois, indemnités km, bénévolat..."
          className={inputClass}
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer text-gray-300">
        <input
          type="checkbox"
          checked={formData.is_urgent}
          onChange={set('is_urgent')}
          className="w-4 h-4 accent-[#DC2626]"
        />
        <span className="text-sm font-medium">Annonce urgente</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 p-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 p-3 bg-[#1D4ED8] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
        >
          {loading ? 'Publication...' : 'Publier l’annonce'}
        </button>
      </div>
    </form>
  )
}
