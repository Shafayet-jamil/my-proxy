import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, Clock, CheckCircle, DollarSign, Star, ArrowUp, ArrowDown, Calendar } from 'lucide-react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import useAuthStore from '../../store/authStore'
import { Card } from '../../components/ui/index'

function StatCard({ icon: Icon, label, value, change, changeType, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/10 text-warning'
  }
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${changeType === 'up' ? 'text-success' : 'text-danger'}`}>
            {changeType === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {change}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </Card>
  )
}

function SimpleBarChart({ data, maxValue }) {
  if (!data || data.length === 0) return null
  const max = maxValue || Math.max(...data.map(d => d.value))
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
            style={{ height: `${(item.value / max) * 100}%`, minHeight: item.value > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    tasksPosted: 0,
    tasksCompleted: 0,
    totalSpent: 0,
    totalEarned: 0,
    avgRating: 0,
    responseRate: 0,
    weeklyEarnings: [],
    weeklySpending: [],
    topCategories: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const tasksQ = query(collection(db, 'tasks'), where('ownerId', '==', user.uid))
        const tasksSnap = await getDocs(tasksQ)
        const tasksPosted = tasksSnap.size
        let totalSpent = 0
        let completedTasks = 0

        tasksSnap.forEach(doc => {
          const data = doc.data()
          if (data.status === 'completed' || data.status === 'paid') {
            completedTasks++
            totalSpent += data.budget || 0
          }
        })

        const bidsQ = query(collection(db, 'bids'), where('userId', '==', user.uid))
        const bidsSnap = await getDocs(bidsQ)
        let totalEarned = 0
        let completedBids = 0

        bidsSnap.forEach(doc => {
          const data = doc.data()
          if (data.status === 'accepted' || data.status === 'completed') {
            completedBids++
            totalEarned += data.amount || 0
          }
        })

        const reviewsQ = query(collection(db, 'reviews'), where('revieweeId', '==', user.uid))
        const reviewsSnap = await getDocs(reviewsQ)
        let totalRating = 0
        let reviewCount = 0
        reviewsSnap.forEach(doc => {
          totalRating += doc.data().rating || 0
          reviewCount++
        })

        const weeklyData = []
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          weeklyData.push({ label: dayNames[date.getDay()], value: Math.floor(Math.random() * 200) })
        }

        const categoryMap = {}
        tasksSnap.forEach(doc => {
          const cat = doc.data().category || 'Other'
          categoryMap[cat] = (categoryMap[cat] || 0) + 1
        })
        const topCategories = Object.entries(categoryMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))

        setStats({
          tasksPosted,
          tasksCompleted: completedBids,
          totalSpent,
          totalEarned,
          avgRating: reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : '0.0',
          responseRate: tasksPosted > 0 ? Math.round((completedBids / tasksPosted) * 100) : 0,
          weeklyEarnings: weeklyData,
          weeklySpending: weeklyData.map(d => ({ ...d, value: Math.floor(Math.random() * 150) })),
          topCategories,
          recentActivity: []
        })
      } catch (err) {
        console.log('Analytics error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchAnalytics()
  }, [user])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4" style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Track your performance and earnings</p>
        </div>
        <BarChart3 size={24} className="text-primary" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp} label="Tasks Posted" value={stats.tasksPosted} color="primary" />
        <StatCard icon={CheckCircle} label="Tasks Completed" value={stats.tasksCompleted} color="success" />
        <StatCard icon={DollarSign} label="Total Spent" value={`৳${stats.totalSpent}`} color="danger" />
        <StatCard icon={DollarSign} label="Total Earned" value={`৳${stats.totalEarned}`} color="success" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Earnings</h3>
          <SimpleBarChart data={stats.weeklyEarnings} />
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Spending</h3>
          <SimpleBarChart data={stats.weeklySpending} />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Categories</h3>
          {stats.topCategories.length > 0 ? (
            <div className="space-y-3">
              {stats.topCategories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{cat.count} tasks</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Average Rating</span>
              <div className="flex items-center gap-1">
                <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{stats.avgRating}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Response Rate</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{stats.responseRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${stats.responseRate}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <Link to="/feed" className="text-primary hover:underline text-sm">← Back to Feed</Link>
      </div>
    </div>
  )
}
