import { Link } from 'react-router-dom'
import { where, orderBy } from 'firebase/firestore'
import { useFirestoreRealtime } from '../../hooks/useFirestore'
import useAuthStore from '../../store/authStore'
import { Card, Avatar } from '../../components/ui/index'
import { formatDistanceToNow } from 'date-fns'

export default function Messages() {
  const { user } = useAuthStore()

  const { data: sentMessages, loading: sentLoading } = useFirestoreRealtime(
    'messages', [where('senderId', '==', user.uid), orderBy('createdAt', 'desc')]
  )
  const { data: receivedMessages, loading: recvLoading } = useFirestoreRealtime(
    'messages', [where('receiverId', '==', user.uid), orderBy('createdAt', 'desc')]
  )

  if (sentLoading || recvLoading) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>

  const allMessages = [...sentMessages, ...receivedMessages]
  const conversationMap = {}
  allMessages.forEach(msg => {
    const key = msg.taskId
    if (!conversationMap[key] || msg.createdAt?.toDate() > conversationMap[key].createdAt?.toDate()) {
      conversationMap[key] = msg
    }
  })

  const conversations = Object.entries(conversationMap).sort((a, b) => {
    const dateA = a[1].createdAt?.toDate?.() || new Date(0)
    const dateB = b[1].createdAt?.toDate?.() || new Date(0)
    return dateB - dateA
  })

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Messages</h1>
      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: 'var(--text-muted)' }}>No messages yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(([taskId, msg]) => {
            const otherName = msg.senderId === user.uid ? msg.receiverName : msg.senderName
            return (
              <Link key={taskId} to={`/messages/${taskId}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar name={otherName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{otherName}</p>
                        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {msg.createdAt?.toDate ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{msg.content}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
