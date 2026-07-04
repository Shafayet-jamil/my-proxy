import { create } from 'zustand'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  init: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getDoc(doc(db, 'users', user.uid))
        set({ user, profile: profile.data() || null, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    })
  },

  signUp: async (email, password, name, referralCode = null) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })

    const myReferralCode = `MP${cred.user.uid.slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      photoURL: cred.user.photoURL || '',
      rating: 0,
      reviewCount: 0,
      walletBalance: 100,
      referralCode: myReferralCode,
      referralCount: 0,
      referralEarnings: 0,
      createdAt: serverTimestamp()
    })

    if (referralCode) {
      try {
        const q = query(collection(db, 'users'), where('referralCode', '==', referralCode))
        const snap = await getDocs(q)
        if (!snap.empty) {
          const referrerDoc = snap.docs[0]
          await updateDoc(doc(db, 'users', referrerDoc.id), {
            walletBalance: increment(50),
            referralCount: increment(1),
            referralEarnings: increment(50)
          })
          await updateDoc(doc(db, 'users', cred.user.uid), {
            walletBalance: increment(50)
          })
          await setDoc(doc(collection(db, 'transactions')), {
            userId: referrerDoc.id,
            type: 'referral_bonus',
            amount: 50,
            description: `Referral bonus for inviting ${name}`,
            createdAt: serverTimestamp()
          })
          await setDoc(doc(collection(db, 'transactions')), {
            userId: cred.user.uid,
            type: 'referral_bonus',
            amount: 50,
            description: 'Welcome bonus for signing up with referral',
            createdAt: serverTimestamp()
          })
        }
      } catch (e) {
        console.log('Referral processing error:', e.message)
      }
    }

    return cred
  },

  signIn: (email, password) =>
    signInWithEmailAndPassword(auth, email, password),

  signInWithGoogle: async () => {
    const cred = await signInWithPopup(auth, googleProvider)
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid))
    if (!userDoc.exists()) {
      const myReferralCode = `MP${cred.user.uid.slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: cred.user.displayName,
        email: cred.user.email,
        photoURL: cred.user.photoURL || '',
        rating: 0,
        reviewCount: 0,
        walletBalance: 100,
        referralCode: myReferralCode,
        referralCount: 0,
        referralEarnings: 0,
        createdAt: serverTimestamp()
      })
    }
  },

  logout: () => signOut(auth)
}))

export default useAuthStore
