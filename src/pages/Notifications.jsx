import { where, orderBy, updateDoc, doc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useFirestoreRealtime } from '../hooks/useFirestore'
import useAuthStore from '../store/authStore'
import { Card, Button } from '../components/ui/index'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCheck, MessageSquare, Star, DollarSign, CheckCircle, XCircle } from 'lucide-react'

const iconMap = {
  new_bid: { icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  bid_accepted: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  task_started: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
  task_completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  task_cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  payment_received: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  new_review: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  new_message: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
  default: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' }
}

export default function Notifications() {
  const { user } = useAuthStore()
  const { data: notifications, loading } = useFirestoreRealtime('notifications', [
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  ])

  const handleMarkAllRead = async () => {
    const batch = writeBatch(db)
    notifications?.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true })
    })
    await batch.commit()
  }

  const handleMarkRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }

  if (loading) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Notifications</h1>
        {notifications?.some(n => !n.read) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark all read
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>You'll be notified about bids, messages, and task updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const config = iconMap[n.type] || iconMap.default
            const Icon = config.icon
            return (
              <Card
                key={n.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${!n.read ? 'ring-2 ring-primary/20' : ''}`}
                onClick={() => {
                  handleMarkRead(n.id)
                  if (n.taskId) window.location.href = `/tasks/${n.taskId}`
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${config.bg} flex-shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold' : ''}`} style={{ color: 'var(--text-primary)' }}>
                      {n.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : ''}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
