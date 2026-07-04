import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'

export async function getRecommendedTasks(userId, userProfile) {
  try {
    const tasksSnap = await getDocs(
      query(collection(db, 'tasks'), where('status', 'in', ['posted', 'in_bidding']))
    )

    const userSkills = userProfile?.skills?.split(',').map(s => s.trim().toLowerCase()) || []
    const userLocation = userProfile?.location?.toLowerCase() || ''

    const scored = []
    tasksSnap.forEach(doc => {
      const task = { id: doc.id, ...doc.data() }
      if (task.ownerId === userId) return

      let score = 0

      if (userSkills.length > 0 && task.category) {
        const taskCat = task.category.toLowerCase()
        if (userSkills.some(s => taskCat.includes(s))) score += 40
        if (taskCat === 'delivery' && userSkills.some(s => s.includes('delivery'))) score += 20
        if (taskCat === 'photography' && userSkills.some(s => s.includes('photo'))) score += 20
        if (taskCat === 'tutoring' && userSkills.some(s => s.includes('tutor'))) score += 20
        if (taskCat === 'cleaning' && userSkills.some(s => s.includes('clean'))) score += 20
        if (taskCat === 'repairs' && userSkills.some(s => s.includes('repair'))) score += 20
        if (taskCat === 'gardening' && userSkills.some(s => s.includes('garden'))) score += 20
      }

      if (userLocation && task.areaName) {
        const taskArea = task.areaName.toLowerCase()
        if (taskArea === userLocation) score += 30
        else if (taskArea.includes(userLocation) || userLocation.includes(taskArea)) score += 15
      }

      if (task.isUrgent) score += 10

      if (task.createdAt?.toDate) {
        const hoursAgo = (Date.now() - task.createdAt.toDate().getTime()) / (1000 * 60 * 60)
        if (hoursAgo < 1) score += 15
        else if (hoursAgo < 6) score += 10
        else if (hoursAgo < 24) score += 5
      }

      const budget = task.budget || 0
      if (budget >= 50 && budget <= 200) score += 5

      scored.push({ ...task, matchScore: score })
    })

    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6)
  } catch (err) {
    console.log('Matching error:', err.message)
    return []
  }
}
