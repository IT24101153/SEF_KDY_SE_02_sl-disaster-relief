// Populates Firebase Auth + Firestore with demo accounts and sample data.
// Run from the project root:  node scripts/seed.mjs
//
// Safe to re-run: existing accounts are reused and each collection is only
// filled when it is empty.

import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBMY-6ycoCsZ-GnTfHRKvhyUIIQrDvbTXg',
  authDomain: 'sl-disaster-relief-connect.firebaseapp.com',
  projectId: 'sl-disaster-relief-connect',
  storageBucket: 'sl-disaster-relief-connect.firebasestorage.app',
  messagingSenderId: '873171326606',
  appId: '1:873171326606:web:83ea023117524d782f5bdf',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const PASSWORD = 'admin123'

const ACCOUNTS = [
  { email: 'admin@admin.com', name: 'Disaster Admin', role: 'disaster_admin' },
  { email: 'news@admin.com', name: 'News Manager', role: 'news_manager' },
  { email: 'relief@admin.com', name: 'Relief Manager', role: 'relief_manager' },
  { email: 'user@demo.com', name: 'Kasun Perera', role: 'user' },
  { email: 'nimali@demo.com', name: 'Nimali Fernando', role: 'user' },
]

const DISASTER_AREAS = [
  { district: 'Colombo', type: 'flood', riskLevel: 'high', description: 'Kelani river has breached its banks near Kolonnawa. Low-lying homes along Wellampitiya Road are under knee-deep water.' },
  { district: 'Gampaha', type: 'flood', riskLevel: 'high', description: 'Biyagama and Kelaniya divisions flooded after overnight rain. Two shelters opened at local schools.' },
  { district: 'Ratnapura', type: 'landslide', riskLevel: 'high', description: 'NBRO landslide warning for slopes above the Kalu Ganga basin. Households on hillsides advised to relocate.' },
  { district: 'Kalutara', type: 'flood', riskLevel: 'medium', description: 'Rising water levels along the Kalu river. Roads to Dodangoda partially submerged.' },
  { district: 'Kegalle', type: 'landslide', riskLevel: 'medium', description: 'Earth slips reported on the Kegalle-Bulathkohupitiya road. Travel is restricted to one lane.' },
  { district: 'Nuwara Eliya', type: 'landslide', riskLevel: 'low', description: 'Minor slope movement observed near Ramboda. Monitoring in place, no evacuation required yet.' },
  { district: 'Badulla', type: 'flood', riskLevel: 'low', description: 'Localised flooding in low-lying paddy land near Passara. Main roads remain open.' },
]

const NEWS = [
  { title: 'Red alert issued for the Kelani river basin', category: 'emergency', content: 'The Irrigation Department has issued a major flood warning for the lower Kelani basin. Residents of Kolonnawa, Kaduwela and Biyagama should move valuables to higher ground and be ready to evacuate.' },
  { title: 'Landslide warning extended for Ratnapura and Kegalle', category: 'emergency', content: 'NBRO has extended its landslide warning for another 24 hours. Households on steep slopes should move to a relative or a designated shelter tonight.' },
  { title: 'Twelve relief shelters now open across the Western Province', category: 'news', content: 'Twelve schools and community halls have been converted into relief shelters, with capacity for roughly 2,400 people. Dry rations and drinking water are being distributed twice daily.' },
  { title: 'Colombo-Avissawella road reopened to light traffic', category: 'news', content: 'Flood water has receded enough to reopen the Colombo-Avissawella road to light vehicles. Heavy vehicles are still being diverted.' },
  { title: 'How to request relief through this platform', category: 'news', content: 'Registered users can submit a relief request describing their district, what they need and how many people are affected. A relief coordinator will assign a team and confirm a delivery time.' },
]

const WEATHER_FORECASTS = [
  { district: 'Colombo', condition: 'Heavy Rain', forecast: '80-120mm expected through tonight. Expect surface flooding on low-lying roads; avoid the Wellampitiya and Kolonnawa approaches after dark.' },
  { district: 'Gampaha', condition: 'Heavy Rain', forecast: 'Continuous rain easing by tomorrow afternoon. Canal levels remain high around Biyagama.' },
  { district: 'Ratnapura', condition: 'Thunderstorms', forecast: 'Thundershowers with gusty winds over the hills. Slope saturation is already high — treat any new cracking as a warning sign.' },
  { district: 'Kalutara', condition: 'Showers', forecast: 'Intermittent showers, 20-40mm. Kalu river still above its normal level but falling slowly.' },
  { district: 'Kandy', condition: 'Cloudy', forecast: 'Overcast with brief light showers. No flood risk expected in the next 24 hours.' },
  { district: 'Jaffna', condition: 'Sunny', forecast: 'Dry and clear across the peninsula. Daytime highs near 33C.' },
]

const REPORTS = [
  { district: 'Matara', type: 'flood', riskLevel: 'high', description: 'Nilwala river overflowing near Akuressa bridge. Around 15 houses on the riverside lane are taking on water.', status: 'pending' },
  { district: 'Kandy', type: 'landslide', riskLevel: 'medium', description: 'Cracks appeared on the slope behind the Peradeniya access road after two days of rain.', status: 'pending' },
  { district: 'Galle', type: 'flood', riskLevel: 'low', description: 'Drains blocked along Wakwella Road, water pooling around half a metre deep at the junction.', status: 'pending' },
]

const RELIEF_REQUESTS = [
  { district: 'Colombo', needType: 'food', peopleCount: 12, description: 'Twelve people sheltering on the upper floor of a house in Wellampitiya. We need drinking water and dry rations.', status: 'pending' },
  { district: 'Ratnapura', needType: 'shelter', peopleCount: 5, description: 'Family of five evacuated from a hillside home, currently staying with neighbours and needing a shelter place.', status: 'pending' },
  { district: 'Gampaha', needType: 'medicine', peopleCount: 3, description: 'Elderly relatives are out of blood pressure and diabetes medication since the pharmacy flooded.', status: 'pending' },
]

async function ensureAccount({ email, name, role }) {
  let uid
  try {
    const credentials = await createUserWithEmailAndPassword(auth, email, PASSWORD)
    await updateProfile(credentials.user, { displayName: name })
    uid = credentials.user.uid
    console.log(`  created ${email}`)
  } catch (err) {
    if (err.code !== 'auth/email-already-in-use') throw err
    const credentials = await signInWithEmailAndPassword(auth, email, PASSWORD)
    uid = credentials.user.uid
    console.log(`  reused  ${email}`)
  }

  // Written while signed in as this account, which the rules require.
  await setDoc(doc(db, 'users', uid), { id: uid, name, email, role, createdAt: serverTimestamp() })
  return uid
}

async function isEmpty(name) {
  const snapshot = await getDocs(query(collection(db, name), limit(1)))
  return snapshot.empty
}

async function seedCollection(name, rows, buildDoc) {
  if (!(await isEmpty(name))) {
    console.log(`  ${name}: already has data, skipped`)
    return
  }
  for (const row of rows) {
    await addDoc(collection(db, name), buildDoc(row))
  }
  console.log(`  ${name}: added ${rows.length}`)
}

async function hasRequestsFor(uid) {
  const snapshot = await getDocs(
    query(collection(db, 'reliefRequests'), where('requestedBy', '==', uid), limit(1)),
  )
  return !snapshot.empty
}

async function main() {
  console.log('Accounts:')
  const uids = {}
  for (const account of ACCOUNTS) {
    uids[account.role === 'user' ? account.email : account.role] = await ensureAccount(account)
  }

  const reporterUid = uids['user@demo.com']
  const secondUid = uids['nimali@demo.com']

  console.log('\nPublic data (as disaster_admin):')
  await signInWithEmailAndPassword(auth, 'admin@admin.com', PASSWORD)
  await seedCollection('disasterAreas', DISASTER_AREAS, (area) => ({
    ...area,
    status: 'active',
    source: 'seed',
    createdAt: serverTimestamp(),
  }))
  await seedCollection('weatherForecasts', WEATHER_FORECASTS, (item) => ({
    ...item,
    createdAt: serverTimestamp(),
  }))

  console.log('\nNews (as news_manager):')
  await signInWithEmailAndPassword(auth, 'news@admin.com', PASSWORD)
  await seedCollection('news', NEWS, (item) => ({
    ...item,
    postedBy: uids.news_manager,
    createdAt: serverTimestamp(),
  }))

  console.log('\nUser submissions (as user@demo.com):')
  await signInWithEmailAndPassword(auth, 'user@demo.com', PASSWORD)
  if (await hasRequestsFor(reporterUid)) {
    console.log('  reports/reliefRequests: demo user already has submissions, skipped')
  } else {
    for (const report of REPORTS) {
      await addDoc(collection(db, 'reports'), {
        ...report,
        reportedBy: reporterUid,
        reviewedBy: null,
        createdAt: serverTimestamp(),
      })
    }
    console.log(`  reports: added ${REPORTS.length}`)
    for (const request of RELIEF_REQUESTS) {
      await addDoc(collection(db, 'reliefRequests'), {
        ...request,
        requestedBy: reporterUid,
        assignedTeam: null,
        scheduledTime: null,
        createdAt: serverTimestamp(),
      })
    }
    console.log(`  reliefRequests: added ${RELIEF_REQUESTS.length}`)
  }

  await signOut(auth)

  console.log('\nDone. Sign in with any of these (password: ' + PASSWORD + '):')
  for (const account of ACCOUNTS) {
    console.log(`  ${account.email.padEnd(20)} ${account.role}`)
  }
  console.log(`\n(second demo user uid: ${secondUid})`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err.code ?? '', err.message)
  process.exit(1)
})
