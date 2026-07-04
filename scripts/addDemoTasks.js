import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp, getDocs } from 'firebase/firestore'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(__dirname, '..', '.env') })

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const demoTasks = [
  {
    title: "Pick up grocery from local market",
    description: "Need someone to pick up groceries from the local market. I'll provide a list. Should take about 30 minutes.",
    category: "Shopping", budget: 15, areaName: "Downtown", address: "123 Main Street",
    isUrgent: false, ownerId: "demo_user_1", ownerName: "Sarah Johnson", ownerPhoto: "", status: "posted"
  },
  {
    title: "Photography for birthday party",
    description: "Looking for a photographer for my daughter's 10th birthday party this weekend. About 2-3 hours of work.",
    category: "Photography", budget: 120, areaName: "Westside", address: "456 Oak Avenue",
    isUrgent: true, ownerId: "demo_user_2", ownerName: "Mike Chen", ownerPhoto: "", status: "posted"
  },
  {
    title: "Deliver package to nearby location",
    description: "Need urgent delivery of a small package to a location 5 miles away. Package is ready for pickup.",
    category: "Delivery", budget: 20, areaName: "East Side", address: "789 Pine Road",
    isUrgent: true, ownerId: "demo_user_3", ownerName: "Emma Davis", ownerPhoto: "", status: "posted"
  },
  {
    title: "Help with moving furniture",
    description: "Need help moving a couch and dining table to my new apartment. Must have a truck or van. About 2 hours work.",
    category: "Moving", budget: 80, areaName: "North District", address: "321 Elm Street",
    isUrgent: false, ownerId: "demo_user_4", ownerName: "James Wilson", ownerPhoto: "", status: "posted"
  },
  {
    title: "Math tutoring for high school student",
    description: "Looking for a math tutor for my son who's struggling with calculus. 2 sessions per week, 1 hour each.",
    category: "Tutoring", budget: 50, areaName: "Suburb Area", address: "567 Maple Lane",
    isUrgent: false, ownerId: "demo_user_5", ownerName: "Lisa Martinez", ownerPhoto: "", status: "posted"
  },
  {
    title: "Document scanning and organization",
    description: "Need someone to scan about 200 documents and organize them digitally. Can be done at my office.",
    category: "Document", budget: 60, areaName: "Business District", address: "890 Commerce Blvd",
    isUrgent: false, ownerId: "demo_user_6", ownerName: "Robert Taylor", ownerPhoto: "", status: "posted"
  },
  {
    title: "Deep cleaning of 2-bedroom apartment",
    description: "Need thorough cleaning of my apartment including kitchen, bathrooms, and all rooms. Supplies provided.",
    category: "Cleaning", budget: 100, areaName: "Riverside", address: "234 River View",
    isUrgent: false, ownerId: "demo_user_7", ownerName: "Maria Garcia", ownerPhoto: "", status: "posted"
  },
  {
    title: "Dog walking service needed",
    description: "Looking for someone to walk my golden retriever twice a day for the next week while I'm away. Very friendly dog!",
    category: "Pet Care", budget: 150, areaName: "Park District", address: "678 Green Park",
    isUrgent: false, ownerId: "demo_user_8", ownerName: "David Brown", ownerPhoto: "", status: "posted"
  },
  {
    title: "Minor plumbing repair needed",
    description: "Kitchen sink is leaking. Need a quick fix. Should be a simple job for someone with basic plumbing skills.",
    category: "Repairs", budget: 70, areaName: "Old Town", address: "345 Heritage Street",
    isUrgent: true, ownerId: "demo_user_9", ownerName: "Jennifer Lee", ownerPhoto: "", status: "posted"
  },
  {
    title: "Garden maintenance and lawn mowing",
    description: "Weekly garden maintenance needed - mowing lawn, trimming hedges, and general upkeep. About 3 hours of work.",
    category: "Gardening", budget: 65, areaName: "Green Valley", address: "901 Garden Road",
    isUrgent: false, ownerId: "demo_user_10", ownerName: "Tom Anderson", ownerPhoto: "", status: "posted"
  },
  {
    title: "Pickup and return library books",
    description: "Need someone to pick up books from the library and return my overdue books. Library is 10 minutes away.",
    category: "Pickup", budget: 12, areaName: "College Area", address: "456 University Ave",
    isUrgent: false, ownerId: "demo_user_11", ownerName: "Amanda White", ownerPhoto: "", status: "posted"
  },
  {
    title: "Event setup assistance needed",
    description: "Need help setting up tables, chairs, and decorations for a small community event. 3-4 hours work.",
    category: "Other", budget: 55, areaName: "Community Center", address: "123 Center Plaza",
    isUrgent: false, ownerId: "demo_user_12", ownerName: "Chris Martin", ownerPhoto: "", status: "posted"
  }
]

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

async function seedAll() {
  console.log('Checking existing data...\n')

  // Seed categories
  const catSnap = await getDocs(collection(db, 'categories'))
  if (catSnap.size === 0) {
    console.log('Seeding categories...')
    for (const cat of defaultCategories) {
      await addDoc(collection(db, 'categories'), { ...cat, active: true, createdAt: serverTimestamp() })
      console.log(`  + ${cat.name}`)
    }
  } else {
    console.log(`Categories: ${catSnap.size} already exist, skipping.`)
  }

  // Seed tasks
  const taskSnap = await getDocs(collection(db, 'tasks'))
  if (taskSnap.size < 5) {
    console.log('\nSeeding demo tasks...')
    for (const task of demoTasks) {
      const daysAhead = Math.floor(Math.random() * 4) + 3
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + daysAhead)
      const expiryDate = new Date(deadline)
      expiryDate.setDate(expiryDate.getDate() + 3)

      await addDoc(collection(db, 'tasks'), {
        ...task,
        budget: Number(task.budget),
        deadline: Timestamp.fromDate(deadline),
        expiryDate: Timestamp.fromDate(expiryDate),
        photos: [],
        escrowAmount: 0,
        escrowStatus: 'none',
        createdAt: serverTimestamp()
      })
      console.log(`  + ${task.title}`)
    }
  } else {
    console.log(`Tasks: ${taskSnap.size} already exist, skipping.`)
  }

  console.log('\nDone!')
  process.exit(0)
}

seedAll().catch(err => { console.error(err); process.exit(1) })
