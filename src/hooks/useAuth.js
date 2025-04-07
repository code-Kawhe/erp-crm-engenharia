'use client'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const docRef = doc(db, 'usuarios', firebaseUser.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setPerfil(docSnap.data().perfil) // Ex: 'admin', 'cliente'
        }
      } else {
        setUser(null)
        setPerfil(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, perfil, loading }
}
