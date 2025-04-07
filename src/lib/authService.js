import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Login com e-mail e senha
export async function login(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  // Buscar perfil do usuário
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);
  const profile = userSnap.exists() ? userSnap.data().perfil : null;

  return { uid: user.uid, email: user.email, perfil: profile };
}

// Logout
export async function logout() {
  await signOut(auth);
}
