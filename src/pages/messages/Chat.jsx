import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send, ArrowLeft } from 'lucide-react'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useRealtimeDoc } from '../../hooks/useFirestore'
import useAuthStore from '../../store/authStore'
import { Button, Input, Card } from '../../components/ui/index'

export default function Chat() {
  const { id: taskId } = useParams()
  const { user, profile } = useAuthStore()
  const { data: task } = useRealtimeDoc('tasks', taskId)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const q = query(collection(db, 'messages'), where('taskId', '==', taskId), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [taskId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const otherUserId = task?.ownerId === user.uid ? task?.assignedTo : task?.ownerId
  const otherUserName = task?.ownerId === user.uid
    ? (task?.assignedTo ? 'Tasker' : 'Unknown')
    : task?.ownerName || 'Owner'

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await addDoc(collection(db, 'messages'), {
        taskId, senderId: user.uid,
        senderName: profile?.name || user.displayName,
        receiverId: otherUserId,
        receiverName: otherUserName,
        content: text.trim(), createdAt: serverTimestamp()
      })

      if (otherUserId && otherUserId !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: otherUserId, type: 'new_message', taskId,
          message: `${profile?.name || user.displayName} sent you a message on "${task?.title || 'a task'}"`,
          read: false, createdAt: serverTimestamp()
        })
      }

      setText('')
    } catch (err) { alert(err.message) }
    finally { setSending(false) }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/messages" className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-secondary)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="font-semibold">{otherUserName}</p>
          {task && <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{task.title}</p>}
        </div>
      </div>

      <Card className="flex-1 p-4 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Start chatting about this task</div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-xl ${msg.senderId === user.uid ? 'bg-primary text-white rounded-br-sm' : 'rounded-bl-sm'}`}
                  style={msg.senderId !== user.uid ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' } : {}}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-primary-light' : ''}`}
                    style={msg.senderId !== user.uid ? { color: 'var(--text-muted)' } : {}}>
                    {msg.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </Card>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className="flex-1" />
        <Button type="submit" disabled={sending || !text.trim()}>
          <Send size={18} />
        </Button>
      </form>
    </div>
  )
}
