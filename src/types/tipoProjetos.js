import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export async function buscarTiposProjeto() {
  const tiposRef = collection(db, 'tiposProjeto')
  const snapshot = await getDocs(tiposRef)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
