import { useEffect, useRef } from 'react'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { app, db } from '../lib/firebase'
import useAuthStore from '../store/authStore'

export function useFCM() {
  const { user } = useAuthStore()
  const tokenSaved = useRef(false)

  useEffect(() => {
    if (!user || tokenSaved.current) return

    const setupFCM = async () => {
      try {
        if (!('Notification' in window)) return

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const messaging = getMessaging(app)

        const currentToken = await getToken(messaging, {
          vapidKey: 'BEl62iUYgUivxVkvUXnIdQbJs1Rc3BhXnQcIFDSiCY7oGOkuYV3zP2VXtQPJ3b3Jz4gJXJY0D3V0rJ6T5oY8U0'
        })

        if (currentToken) {
          const userRef = doc(db, 'users', user.uid)
          const userSnap = await getDoc(userRef)
          const existingTokens = userSnap.data()?.fcmTokens || []

          if (!existingTokens.includes(currentToken)) {
            await updateDoc(userRef, {
              fcmTokens: [...existingTokens, currentToken]
            })
          }
          tokenSaved.current = true
        }
      } catch (err) {
        console.log('FCM setup skipped:', err.message)
      }
    }

    setupFCM()
  }, [user])

  useEffect(() => {
    if (!user) return

    try {
      const messaging = getMessaging(app)
      const unsubscribe = onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {}
        if (title) {
          new Notification(title, {
            body: body || '',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: payload.data?.taskId || 'general'
          })
        }
      })
      return () => unsubscribe()
    } catch (err) {
      console.log('FCM listener skipped:', err.message)
    }
  }, [user])
}
