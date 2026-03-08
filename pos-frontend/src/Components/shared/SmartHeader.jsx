import React from 'react'
import { useAuth } from '../../context/AuthContext'
import AdminHeader from './AdminHeader'
import HeaderGuest from './HeaderGuest'

/**
 * SmartHeader — renders AdminHeader for admins, HeaderGuest for everyone else.
 * Drop this into App.jsx (or your layout) in place of wherever you currently
 * render <HeaderGuest /> or <AdminHeader />.
 *
 * Usage in App.jsx:
 *   import SmartHeader from './Components/Header/SmartHeader'
 *   ...
 *   <SmartHeader />
 */
const SmartHeader = () => {
  const { user, loading } = useAuth()

  // While auth is resolving don't flash the wrong header
  if (loading) return null

  return user?.role === 'admin' ? <AdminHeader /> : <HeaderGuest />
}

export default SmartHeader