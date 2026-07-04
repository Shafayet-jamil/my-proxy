import { collection, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

const DEMO_TASKS = [
  { title: "Gulshan to Banani document delivery", description: "Need someone to deliver important documents from Gulshan-1 to Banani. The office is near Banani 11. Should take 30 minutes by bike.", category: "Delivery", budget: 80, areaName: "Gulshan", address: "Gulshan-1 Circle", isUrgent: true, ownerId: "demo_user_1", ownerName: "Tanvir Hossain", ownerPhoto: "", status: "posted" },
  { title: "Wedding photography - Dhanmondi Lake area", description: "Looking for a photographer for my sister's wedding reception this Friday. Need someone experienced with indoor event photography. 4-5 hours work.", category: "Photography", budget: 3500, areaName: "Dhanmondi", address: "Dhanmondi Lake Party Center", isUrgent: true, ownerId: "demo_user_2", ownerName: "Nusrat Jahan", ownerPhoto: "", status: "posted" },
  { title: "Pick up medicine from Farmgate pharmacy", description: "I'm stuck at home with a fever. Need someone to pick up medicines from Medicine Mart, Farmgate and deliver to Uttara. Will pay via bKash.", category: "Pickup", budget: 100, areaName: "Farmgate", address: "Medicine Mart, Farmgate", isUrgent: true, ownerId: "demo_user_3", ownerName: "Sakib Rahman", ownerPhoto: "", status: "posted" },
  { title: "House shifting - Mirpur to Mohammadpur", description: "Moving from Mirpur 10 to Mohammadpur. Need 2 helpers with a truck. Furniture includes 1 bed, 1 almirah, 1 sofa, dining table. Half day job.", category: "Moving", budget: 2500, areaName: "Mirpur", address: "Mirpur 10, Road 5", isUrgent: false, ownerId: "demo_user_4", ownerName: "Farhan Ahmed", ownerPhoto: "", status: "posted" },
  { title: "English tutoring for HSC student", description: "Need an English tutor for my daughter preparing for HSC exam. 3 days a week, 1.5 hours per session. Must have good command of English literature.", category: "Tutoring", budget: 2000, areaName: "Uttara", address: "Uttara Sector 7", isUrgent: false, ownerId: "demo_user_5", ownerName: "Sabrina Mostafa", ownerPhoto: "", status: "posted" },
  { title: "200 pages document scanning - Motijheel office", description: "Need to scan about 200 pages of old office records and save as PDF. Scanner is available at the office. Should take 3-4 hours.", category: "Document", budget: 500, areaName: "Motijheel", address: "Dilkusha C/A, Motijheel", isUrgent: false, ownerId: "demo_user_6", ownerName: "Kamal Uddin", ownerPhoto: "", status: "posted" },
  { title: "Deep cleaning - 3 bedroom apartment Banasree", description: "Need thorough cleaning of my 3-bedroom flat before Eid. Kitchen, 2 bathrooms, all rooms. I'll provide cleaning supplies. Full day job.", category: "Cleaning", budget: 1800, areaName: "Banasree", address: "Block C, Banasree", isUrgent: false, ownerId: "demo_user_7", ownerName: "Fatema Begum", ownerPhoto: "", status: "posted" },
  { title: "Feed my cat for 5 days - Badda", description: "Going on vacation for 5 days. Need someone to visit my apartment twice daily to feed my Persian cat and clean the litter box. I'll provide all supplies.", category: "Pet Care", budget: 800, areaName: "Badda", address: "Badda Link Road", isUrgent: false, ownerId: "demo_user_8", ownerName: "Raihan Kabir", ownerPhoto: "", status: "posted" },
  { title: "Bathroom pipe leak repair - Tejgaon", description: "There's a leak in the bathroom pipe behind the shower. Water is dripping constantly. Need an experienced plumber to fix it today or tomorrow.", category: "Repairs", budget: 600, areaName: "Tejgaon", address: "Tejgaon Industrial Area", isUrgent: true, ownerId: "demo_user_9", ownerName: "Anika Rahman", ownerPhoto: "", status: "posted" },
  { title: "Rooftop garden setup - Baridhara", description: "Want to set up a small rooftop garden with 10-15 pots. Need help with soil preparation, planting, and setting up a basic irrigation system.", category: "Gardening", budget: 1500, areaName: "Baridhara", address: "Baridhara J Block", isUrgent: false, ownerId: "demo_user_10", ownerName: "Zahid Hasan", ownerPhoto: "", status: "posted" },
  { title: "Grocery shopping from Shwapno - Bashundhara", description: "Need someone to do weekly grocery shopping from Shwapno, Bashundhara R/A. I'll send the list via WhatsApp. Should take about 1 hour.", category: "Shopping", budget: 150, areaName: "Bashundhara", address: "Shwapno, Bashundhara R/A", isUrgent: false, ownerId: "demo_user_11", ownerName: "Maliha Khan", ownerPhoto: "", status: "posted" },
  { title: "Car AC repair needed - Segunbagicha", description: "My car AC is not cooling properly. Need a mechanic who can come to Segunbagicha and check the AC compressor. Preferably today.", category: "Repairs", budget: 1200, areaName: "Segunbagicha", address: "Segunbagicha, Road 3", isUrgent: true, ownerId: "demo_user_12", ownerName: "Asif Mahmud", ownerPhoto: "", status: "posted" },
  { title: "Birthday cake pickup from Puran Dhaka", description: "Need someone to pick up a birthday cake from a bakery in Old Dhaka and deliver it to my party venue in Banani by 6 PM today.", category: "Delivery", budget: 200, areaName: "Old Dhaka", address: "Nimtali, Old Dhaka", isUrgent: true, ownerId: "demo_user_13", ownerName: "Tasnim Ahmed", ownerPhoto: "", status: "posted" },
  { title: "Math tutor for Class 8 student - Khilgaon", description: "My son needs help with math, especially algebra and geometry. Looking for a tutor who can come home 2 days a week. 1 hour per session.", category: "Tutoring", budget: 1500, areaName: "Khilgaon", address: "Khilgaon Taltola", isUrgent: false, ownerId: "demo_user_14", ownerName: "Ruma Akter", ownerPhoto: "", status: "posted" },
  { title: "Apartment move-out cleaning - Lalmatia", description: "Moving out tomorrow. Need deep cleaning of the entire apartment - floors, walls, kitchen, bathroom. Must be done by evening.", category: "Cleaning", budget: 1200, areaName: "Lalmatia", address: "Lalmatia Block D", isUrgent: true, ownerId: "demo_user_15", ownerName: "Imran Sharif", ownerPhoto: "", status: "posted" },
  { title: "Event photography for corporate seminar", description: "Need a professional photographer for a corporate seminar at Radisson. Full day coverage, 10 AM to 5 PM. Need someone with experience in corporate events.", category: "Photography", budget: 5000, areaName: "Gulshan", address: "Radisson Blu, Gulshan", isUrgent: false, ownerId: "demo_user_16", ownerName: "Nadia Islam", ownerPhoto: "", status: "posted" },
  { title: "Deliver food to patient at Dhaka Medical", description: "Need someone to pick up homemade food from my home in Shahbagh and deliver it to my relative admitted at Dhaka Medical College Hospital.", category: "Delivery", budget: 80, areaName: "Shahbagh", address: "Shahbagh, Dhaka Medical", isUrgent: true, ownerId: "demo_user_17", ownerName: "Rubaiyat Jahan", ownerPhoto: "", status: "posted" },
  { title: "Lawn mowing and garden cleanup - Uttara", description: "Need help with lawn mowing, weeding, and general garden cleanup. My garden is about 500 sq ft. Should take 2-3 hours.", category: "Gardening", budget: 600, areaName: "Uttara", address: "Uttara Sector 12", isUrgent: false, ownerId: "demo_user_18", ownerName: "Shafiq Rahman", ownerPhoto: "", status: "posted" },
  { title: "Passport photo and form filling - Agargaon", description: "Need help with filling out passport renewal form and getting proper passport-sized photos taken. Must know the current process.", category: "Document", budget: 300, areaName: "Agargaon", address: "Agargaon, Passport Office", isUrgent: false, ownerId: "demo_user_19", ownerName: "Momena Khatun", ownerPhoto: "", status: "posted" },
  { title: "Fetch laptop from repair shop - Elephant Road", description: "Need someone to pick up my laptop from the repair shop on Elephant Road and bring it to my home in Mirpur 11. I'll pay the repair bill separately.", category: "Pickup", budget: 100, areaName: "Elephant Road", address: "Elephant Road, Computer Market", isUrgent: false, ownerId: "demo_user_20", ownerName: "Arifur Rahman", ownerPhoto: "", status: "posted" },
]

const DEFAULT_CATEGORIES = [
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

let seeded = false

export async function autoSeedIfEmpty() {
  if (seeded) return
  seeded = true

  try {
    const taskSnap = await getDocs(collection(db, 'tasks'))
    if (taskSnap.size >= 5) return

    console.log('Auto-seeding demo tasks...')
    for (const task of DEMO_TASKS) {
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
    }
    console.log('Demo tasks seeded!')
  } catch (err) {
    console.log('Auto-seed skipped:', err.message)
  }

  try {
    const catSnap = await getDocs(collection(db, 'categories'))
    if (catSnap.size >= 5) return

    console.log('Auto-seeding categories...')
    for (const cat of DEFAULT_CATEGORIES) {
      await addDoc(collection(db, 'categories'), { ...cat, active: true, createdAt: serverTimestamp() })
    }
    console.log('Categories seeded!')
  } catch (err) {
    console.log('Category seed skipped:', err.message)
  }
}
