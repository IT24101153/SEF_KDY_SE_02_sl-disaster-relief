import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { DISASTER_AREAS, NEWS } from './collections.js'

export const SAMPLE_DISASTER_AREAS = [
  {
    district: 'Colombo',
    type: 'flood',
    riskLevel: 'high',
    description:
      'Kelani river has breached its banks near Kolonnawa. Low-lying homes along Wellampitiya Road are under knee-deep water.',
  },
  {
    district: 'Gampaha',
    type: 'flood',
    riskLevel: 'high',
    description:
      'Biyagama and Kelaniya divisions flooded after overnight rain. Two shelters opened at local schools.',
  },
  {
    district: 'Ratnapura',
    type: 'landslide',
    riskLevel: 'high',
    description:
      'NBRO landslide warning for slopes above the Kalu Ganga basin. Households on hillsides advised to relocate.',
  },
  {
    district: 'Kalutara',
    type: 'flood',
    riskLevel: 'medium',
    description:
      'Rising water levels along the Kalu river. Roads to Dodangoda partially submerged.',
  },
  {
    district: 'Kegalle',
    type: 'landslide',
    riskLevel: 'medium',
    description:
      'Earth slips reported on the Kegalle–Bulathkohupitiya road. Travel is restricted to one lane.',
  },
  {
    district: 'Nuwara Eliya',
    type: 'landslide',
    riskLevel: 'low',
    description:
      'Minor slope movement observed near Ramboda. Monitoring in place, no evacuation required yet.',
  },
  {
    district: 'Badulla',
    type: 'flood',
    riskLevel: 'low',
    description:
      'Localised flooding in low-lying paddy land near Passara. Main roads remain open.',
  },
]

export const SAMPLE_NEWS = [
  {
    title: 'Red alert issued for the Kelani river basin',
    category: 'emergency',
    content:
      'The Irrigation Department has issued a major flood warning for the lower Kelani basin. Residents of Kolonnawa, Kaduwela and Biyagama should move valuables to higher ground and be ready to evacuate.',
  },
  {
    title: 'Landslide warning extended for Ratnapura and Kegalle',
    category: 'emergency',
    content:
      'NBRO has extended its landslide warning for another 24 hours. Households on steep slopes should move to a relative or a designated shelter tonight.',
  },
  {
    title: 'Twelve relief shelters now open across the Western Province',
    category: 'news',
    content:
      'Twelve schools and community halls have been converted into relief shelters, with capacity for roughly 2,400 people. Dry rations and drinking water are being distributed twice daily.',
  },
  {
    title: 'Colombo–Avissawella road reopened to light traffic',
    category: 'news',
    content:
      'Flood water has receded enough to reopen the Colombo–Avissawella road to light vehicles. Heavy vehicles are still being diverted.',
  },
  {
    title: 'How to request relief through this platform',
    category: 'news',
    content:
      'Registered users can submit a relief request describing their district, what they need and how many people are affected. A relief coordinator will assign a team and confirm a delivery time.',
  },
]

async function isEmpty(collectionName) {
  const snapshot = await getDocs(query(collection(db, collectionName), limit(1)))
  return snapshot.empty
}

// Both seeders no-op when the collection already holds data, so repeated
// clicks cannot create duplicates.
export async function seedDisasterAreas() {
  if (!(await isEmpty(DISASTER_AREAS))) {
    return { seeded: 0, skipped: true }
  }

  await Promise.all(
    SAMPLE_DISASTER_AREAS.map((area) =>
      addDoc(collection(db, DISASTER_AREAS), {
        ...area,
        status: 'active',
        source: 'seed',
        createdAt: serverTimestamp(),
      }),
    ),
  )

  return { seeded: SAMPLE_DISASTER_AREAS.length, skipped: false }
}

export async function seedNews(postedBy) {
  if (!(await isEmpty(NEWS))) {
    return { seeded: 0, skipped: true }
  }

  await Promise.all(
    SAMPLE_NEWS.map((item) =>
      addDoc(collection(db, NEWS), {
        ...item,
        postedBy: postedBy ?? 'seed',
        createdAt: serverTimestamp(),
      }),
    ),
  )

  return { seeded: SAMPLE_NEWS.length, skipped: false }
}
