import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBe4exW0UpJX4PvIU-HcH6GS0KcbA9Fbkk",
  authDomain: "my-proxy-b15ee.firebaseapp.com",
  projectId: "my-proxy-b15ee",
  storageBucket: "my-proxy-b15ee.firebasestorage.app",
  messagingSenderId: "172311892979",
  appId: "1:172311892979:web:4262bd72d3138274a33886"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const defaultCategories = [
  { name: 'Delivery', icon: 'Truck', description: 'Pick up & drop off', color: 'bg-blue-100 text-blue-600', order: 1 },
  { name: 'Photography', icon: 'Camera', description: 'Capture moments', color: 'bg-purple-100 text-purple-600', order: 2 },
  { name: 'Document', icon: 'FileText', description: 'Submit & file', color: 'bg-green-100 text-green-600', order: 3 },
  { name: 'Shopping', icon: 'ShoppingBag', description: 'Run errands', color: 'bg-pink-100 text-pink-600', order: 4 },
  { name: 'Pickup', icon: 'Package', description: 'Collect items', color: 'bg-orange-100 text-orange-600', order: 5 },
  { name: 'Cleaning', icon: 'Sparkles', description: 'Cleaning services', color: 'bg-cyan-100 text-cyan-600', order: 6 },
  { name: 'Moving', icon: 'Move', description: 'Relocation help', color: 'bg-indigo-100 text-indigo-600', order: 7 },
  { name: 'Repairs', icon: 'Wrench', description: 'Fix & repair', color: 'bg-red-100 text-red-600', order: 8 },
  { name: 'Tutoring', icon: 'BookOpen', description: 'Teach & learn', color: 'bg-yellow-100 text-yellow-600', order: 9 },
  { name: 'Pet Care', icon: 'PawPrint', description: 'Animal care', color: 'bg-amber-100 text-amber-600', order: 10 },
  { name: 'Gardening', icon: 'Flower2', description: 'Garden maintenance', color: 'bg-emerald-100 text-emerald-600', order: 11 },
  { name: 'Other', icon: 'MoreHorizontal', description: 'Miscellaneous tasks', color: 'bg-gray-100 text-gray-600', order: 12 },
]

async function seedCategories() {
  console.log('Seeding categories...')

  const existing = await getDocs(collection(db, 'categories'))
  if (existing.size > 0) {
    console.log(`Found ${existing.size} existing categories. Skipping seed.`)
    process.exit(0)
  }

  for (const cat of defaultCategories) {
    try {
      await addDoc(collection(db, 'categories'), {
        ...cat,
        active: true,
        createdAt: serverTimestamp()
      })
      console.log(`Added: ${cat.name}`)
    } catch (err) {
      console.error(`Error adding ${cat.name}:`, err.message)
    }
  }

  console.log('Done!')
  process.exit(0)
}

seedCategories()
