import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import { LOGO_B64 } from './constants.js'

// Kalkulatori
import KalkulatorFolija from './components/kalkulatori/KalkulatorFolija.jsx'
import KalkulatorKesa from './components/kalkulatori/KalkulatorKesa.jsx'
import KalkulatorSpulna from './components/kalkulatori/KalkulatorSpulna.jsx'

// Nalozi
import OperativniNalozi from './components/nalozi/OperativniNalozi.jsx'
import PregledNaloga from './components/nalozi/PregledNaloga.jsx'
import PracenjeNaloga from './components/nalozi/PracenjeNaloga.jsx'

// Ostalo
import Dashboard from './components/Dashboard.jsx'
import Magacin from './components/Magacin.jsx'
import BazaProizvoda from './components/BazaProizvoda.jsx'
import AIpanel from './components/AIpanel.jsx'
import AIsecenjeOptimizer from './components/AIsecenjeOptimizer.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dash')
  
  // Supabase auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Login/Logout
  const handleLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Helper funkcije za stilizovanje
  const card = (children, title = null) => (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      {title && <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>}
      {children}
    </div>
  )

  const btn = (text, onClick, variant = 'primary') => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
    }
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded font-medium transition-colors ${variants[variant]}`}
      >
        {text}
      </button>
    )
  }

  const inp = (value, onChange, placeholder = '', type = 'text') => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )

  const lbl = (text) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">{text}</label>
  )

  const msg = (text, type = 'info') => {
    const types = {
      info: 'bg-blue-50 text-blue-800 border-blue-200',
      success: 'bg-green-50 text-green-800 border-green-200',
      error: 'bg-red-50 text-red-800 border-red-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    }
    return (
      <div className={`p-4 rounded border ${types[type]} mb-4`}>
        {text}
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    )
  }

  // Login screen
  if (!user) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <img src={LOGO_B64} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Maropack Sistem</h1>
            <p className="text-gray-600">Upravljanje proizvodnjom</p>
          </div>
          <div className="space-y-4">
            <div>
              {lbl('Email')}
              {inp(email, setEmail, 'ime@primer.com', 'email')}
            </div>
            <div>
              {lbl('Lozinka')}
              {inp(password, setPassword, '••••••••', 'password')}
            </div>
            {btn('Prijavi se', () => handleLogin(email, password))}
          </div>
        </div>
      </div>
    )
  }

  // Navigation
  const nav = [
    { k: 'dash', l: 'Dashboard', i: '📊' },
    { k: 'kalk_folija', l: 'Kalk. Folije', i: '🎞️' },
    { k: 'kalk_kesa', l: 'Kalk. Kese', i: '🛍️' },
    { k: 'kalk_spulna', l: 'Kalk. Špulne', i: '🔄' },
    { k: 'operativni', l: 'Lista Kalkulacija', i: '📋' },
    { k: 'nalozi', l: 'Pregled Naloga', i: '🔧' },
    { k: 'pracenje', l: 'Praćenje', i: '🔴' },
    { k: 'magacin', l: 'Magacin', i: '🏭' },
    { k: 'baza', l: 'Baza Proizvoda', i: '📦' },
    { k: 'ai', l: 'AI Asistent', i: '🤖' },
    { k: 'secenje', l: 'AI Sečenje', i: '✂️' },
  ]

  // Main App
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={LOGO_B64} alt="Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold">Maropack</h1>
                <p className="text-xs text-blue-100">Proizvodnja ambalaže</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
              >
                Odjavi se
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-2 space-x-2">
            {nav.map((n) => (
              <button
                key={n.k}
                onClick={() => setPage(n.k)}
                className={`px-4 py-2 rounded whitespace-nowrap font-medium transition-colors ${
                  page === n.k
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {n.i} {n.l}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {page === 'dash' && <Dashboard user={user} card={card} btn={btn} msg={msg} />}
        
        {page === 'kalk_folija' && (
          <KalkulatorFolija
            user={user}
            card={card}
            btn={btn}
            inp={inp}
            lbl={lbl}
            msg={msg}
          />
        )}
        
        {page === 'kalk_kesa' && (
          <KalkulatorKesa
            user={user}
            card={card}
            btn={btn}
            inp={inp}
            lbl={lbl}
            msg={msg}
          />
        )}
        
        {page === 'kalk_spulna' && (
          <KalkulatorSpulna
            user={user}
            card={card}
            btn={btn}
            inp={inp}
            lbl={lbl}
            msg={msg}
          />
        )}
        
        {page === 'operativni' && (
          <OperativniNalozi
            user={user}
            card={card}
            btn={btn}
            inp={inp}
            lbl={lbl}
            msg={msg}
          />
        )}
        
        {page === 'nalozi' && (
          <PregledNaloga
            user={user}
            card={card}
            btn={btn}
            msg={msg}
          />
        )}
        
        {page === 'pracenje' && (
          <PracenjeNaloga
            user={user}
            card={card}
            msg={msg}
          />
        )}
        
        {page === 'magacin' && (
          <Magacin
            user={user}
            card={card}
            btn={btn}
            inp={inp}
            lbl={lbl}
            msg={msg}
          />
        )}
        
        {page === 'baza' && (
          <BazaProizvoda
            user={user}
            card={card}
            btn={btn}
            inp={inp}
            lbl={lbl}
            msg={msg}
          />
        )}
        
        {page === 'ai' && (
          <AIpanel
            user={user}
            card={card}
            btn={btn}
            inp={inp}
            msg={msg}
          />
        )}
        
        {page === 'secenje' && (
          <AIsecenjeOptimizer
            user={user}
            card={card}
            btn={btn}
            inp={inp}
            lbl={lbl}
            msg={msg}
          />
        )}
      </main>
    </div>
  )
}

export default App
