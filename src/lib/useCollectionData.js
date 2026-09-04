import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase.js'

// Sorting happens client-side so a `where` + `orderBy` pair on different
// fields never requires a composite Firestore index.
export function useCollectionData(collectionName, filterField, filterValue) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const base = collection(db, collectionName)
    const target = filterField
      ? query(base, where(filterField, '==', filterValue))
      : base

    return onSnapshot(target, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      docs.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
      )
      setData(docs)
      setLoading(false)
    })
  }, [collectionName, filterField, filterValue])

  return { data, loading }
}
