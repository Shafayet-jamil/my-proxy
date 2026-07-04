import { Link } from 'react-router-dom'
import { MapPin, DollarSign } from 'lucide-react'
import { where, orderBy } from 'firebase/firestore'
import { useFirestoreRealtime } from '../../hooks/useFirestore'
import useAuthStore from '../../store/authStore'
import { Card, Badge } from '../../components/ui/index'
import { formatDistanceToNow } from 'date-fns'

const statusBadge = {
  'posted': 'default', 'in_bidding': 'warning', 'assigned': 'primary',
  'in_progress': 'primary', 'completed': 'success', 'cancelled': 'danger', 'expired': 'danger'
}

export default function MyTasks() {
  const { user } = useAuthStore()
  const { data: tasks, loading } = useFirestoreRealtime('tasks', [
    where('ownerId', '==', user.uid),
    orderBy('createdAt', 'desc')
  ])

  if (loading) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">My Posted Tasks</h1>
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="mb-4" style={{ color: 'var(--text-muted)' }}>You haven't posted any tasks yet</p>
          <Link to="/tasks/new" className="text-primary font-medium hover:underline">Post your first task</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <Link key={task.id} to={`/tasks/${task.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{task.title}</h3>
                      {task.isUrgent && <Badge variant="danger">Urgent</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {task.areaName}</span>
                      <span className="flex items-center gap-1"><DollarSign size={14} /> ৳{task.budget}</span>
                      <span>{task.createdAt?.toDate ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true }) : ''}</span>
                    </div>
                  </div>
                  <Badge variant={statusBadge[task.status]}>{task.status.replace('_', ' ')}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
