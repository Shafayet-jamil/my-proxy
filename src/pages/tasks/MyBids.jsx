import { Link } from 'react-router-dom'
import { where, orderBy } from 'firebase/firestore'
import { useFirestoreRealtime } from '../../hooks/useFirestore'
import useAuthStore from '../../store/authStore'
import { Card, Badge } from '../../components/ui/index'

const statusBadge = {
  'pending': 'warning', 'accepted': 'success', 'rejected': 'danger'
}

export default function MyBids() {
  const { user } = useAuthStore()
  const { data: bids, loading } = useFirestoreRealtime('bids', [
    where('bidderId', '==', user.uid),
    orderBy('createdAt', 'desc')
  ])

  if (loading) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">My Bids</h1>
      {bids.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: 'var(--text-muted)' }}>You haven't placed any bids yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map(bid => (
            <Link key={bid.id} to={`/tasks/${bid.taskId}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Bid: ৳{bid.proposedPrice}</p>
                    {bid.message && <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{bid.message}</p>}
                  </div>
                  <Badge variant={statusBadge[bid.status]}>{bid.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
