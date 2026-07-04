import { useState } from 'react'
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useEffect } from 'react'

export function useFirestoreRealtime(collectionName, constraints = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints)
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [collectionName])

  return { data, loading }
}

export async function createDoc(collectionName, data) {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp()
  })
}

export async function updateDocById(collectionName, id, data) {
  return updateDoc(doc(db, collectionName, id), data)
}

export async function getDocById(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function useRealtimeDoc(collectionName, id) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const unsub = onSnapshot(doc(db, collectionName, id), (snap) => {
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })
    return unsub
  }, [collectionName, id])

  return { data, loading }
}
