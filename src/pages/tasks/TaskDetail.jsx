import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, DollarSign, Clock, MessageSquare, CheckCircle, XCircle, Loader2, Star, AlertTriangle, Wallet, Trash2 } from 'lucide-react'
import { collection, where, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useRealtimeDoc, useFirestoreRealtime } from '../../hooks/useFirestore'
import useAuthStore from '../../store/authStore'
import { Button, Input, Textarea, Card, Badge, Avatar } from '../../components/ui/index'
import { formatDistanceToNow } from 'date-fns'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { data: task, loading: taskLoading } = useRealtimeDoc('tasks', id)
  const { data: bids } = useFirestoreRealtime('bids', [where('taskId', '==', id)])
  const [bidPrice, setBidPrice] = useState('')
  const [bidMsg, setBidMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  const isOwner = user?.uid === task?.ownerId
  const userBid = bids?.find(b => b.bidderId === user?.uid)

  const canReview = task?.status === 'completed' && !task?.[isOwner ? 'ownerReviewed' : 'taskerReviewed']

  useEffect(() => {
    if (!task) return
    const checkExpiry = async () => {
      const now = new Date()
      const expiryDate = task.expiryDate?.toDate ? task.expiryDate.toDate() : null
      if (expiryDate && now > expiryDate && task.status !== 'completed' && task.status !== 'cancelled') {
        await updateDoc(doc(db, 'tasks', id), { status: 'expired' })
      }
    }
    checkExpiry()
  }, [task, id])

  const isExpired = task?.status === 'expired' || (task?.expiryDate?.toDate && new Date() > task.expiryDate.toDate())
  const deadline = task?.deadline?.toDate ? task.deadline.toDate() : null
  const expiryDate = task?.expiryDate?.toDate ? task.expiryDate.toDate() : null

  const handleBid = async (e) => {
    e.preventDefault()
    if (!bidPrice) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'bids'), {
        taskId: id,
        bidderId: user.uid,
        bidderName: profile?.name || user.displayName,
        bidderPhoto: profile?.photoURL || user.photoURL || '',
        proposedPrice: Number(bidPrice),
        message: bidMsg,
        status: 'pending',
        createdAt: serverTimestamp()
      })
      await updateDoc(doc(db, 'tasks', id), { status: 'in_bidding' })

      await addDoc(collection(db, 'notifications'), {
        userId: task.ownerId,
        type: 'new_bid',
        taskId: id,
        message: `${profile?.name || user.displayName} placed a bid of ৳${bidPrice} on "${task.title}"`,
        read: false,
        createdAt: serverTimestamp()
      })

      setBidPrice('')
      setBidMsg('')
    } catch (err) { alert(err.message) }
    finally { setSubmitting(false) }
  }

  const handleAcceptBid = async (bidId) => {
    const bid = bids.find(b => b.id === bidId)
    if (!bid) return

    const posterSnap = await getDoc(doc(db, 'users', user.uid))
    const posterBalance = posterSnap.data()?.walletBalance || 0
    if (posterBalance < bid.proposedPrice) {
      alert('Insufficient wallet balance. Please add funds to your wallet first.')
      return
    }

    await updateDoc(doc(db, 'bids', bidId), { status: 'accepted' })
    await updateDoc(doc(db, 'tasks', id), {
      status: 'assigned',
      assignedTo: bid.bidderId,
      escrowAmount: bid.proposedPrice,
      escrowStatus: 'locked'
    })
    bids.filter(b => b.id !== bidId).forEach(b => {
      updateDoc(doc(db, 'bids', b.id), { status: 'rejected' })
    })

    const newBalance = posterBalance - bid.proposedPrice
    await updateDoc(doc(db, 'users', user.uid), { walletBalance: newBalance })

    await addDoc(collection(db, 'transactions'), {
      fromId: user.uid,
      toId: 'escrow',
      amount: bid.proposedPrice,
      type: 'escrow_lock',
      status: 'completed',
      receiptNo: 'ESC-' + Date.now(),
      description: `Escrow locked for task: ${task.title}`,
      taskId: id,
      createdAt: serverTimestamp()
    })

    await addDoc(collection(db, 'notifications'), {
      userId: bid.bidderId,
      type: 'bid_accepted',
      taskId: id,
      message: `Your bid of ৳${bid.proposedPrice} on "${task.title}" has been accepted!`,
      read: false,
      createdAt: serverTimestamp()
    })
  }

  const handleStatusUpdate = async (status) => {
    if (status === 'completed' && task.escrowStatus === 'locked') {
      const taskerSnap = await getDoc(doc(db, 'users', task.assignedTo))
      const taskerBalance = taskerSnap.data()?.walletBalance || 0

      await updateDoc(doc(db, 'users', task.assignedTo), {
        walletBalance: taskerBalance + task.escrowAmount
      })

      await addDoc(collection(db, 'transactions'), {
        fromId: 'escrow',
        toId: task.assignedTo,
        amount: task.escrowAmount,
        type: 'escrow_release',
        status: 'completed',
        receiptNo: 'REL-' + Date.now(),
        description: `Payment released for task: ${task.title}`,
        taskId: id,
        createdAt: serverTimestamp()
      })

      await addDoc(collection(db, 'notifications'), {
        userId: task.assignedTo,
        type: 'payment_received',
        taskId: id,
        message: `You received ৳${task.escrowAmount} for completing "${task.title}"!`,
        read: false,
        createdAt: serverTimestamp()
      })

      await updateDoc(doc(db, 'tasks', id), { status, escrowStatus: 'released' })
    } else {
      await updateDoc(doc(db, 'tasks', id), { status })
    }

    if (status === 'in_progress') {
      await addDoc(collection(db, 'notifications'), {
        userId: task.ownerId,
        type: 'task_started',
        taskId: id,
        message: `Task "${task.title}" has been started by ${profile?.name || user.displayName}`,
        read: false,
        createdAt: serverTimestamp()
      })
    }
  }

  const handleCancelTask = async () => {
    if (!window.confirm('Are you canceling because the tasker did not show up?')) return
    const noShow = window.confirm('Did the tasker fail to show up without notifying you 6 hours in advance?')

    if (noShow && task.assignedTo) {
      const taskerRef = doc(db, 'users', task.assignedTo)
      const taskerSnap = await getDoc(taskerRef)
      const currentPenalty = taskerSnap.data()?.penaltyPoints || 0
      await updateDoc(taskerRef, { penaltyPoints: currentPenalty + 1 })
      await addDoc(collection(db, 'penalties'), {
        taskId: id, userId: task.assignedTo, reason: 'no_show', createdAt: serverTimestamp()
      })
      alert('Penalty point applied to tasker')
    }

    if (task.escrowStatus === 'locked') {
      const posterSnap = await getDoc(doc(db, 'users', user.uid))
      const posterBalance = posterSnap.data()?.walletBalance || 0
      await updateDoc(doc(db, 'users', user.uid), { walletBalance: posterBalance + task.escrowAmount })
      await addDoc(collection(db, 'transactions'), {
        fromId: 'escrow', toId: user.uid, amount: task.escrowAmount,
        type: 'escrow_refund', status: 'completed',
        receiptNo: 'REF-' + Date.now(),
        description: `Escrow refunded for cancelled task: ${task.title}`,
        taskId: id, createdAt: serverTimestamp()
      })
    }

    await addDoc(collection(db, 'notifications'), {
      userId: task.assignedTo || task.ownerId,
      type: 'task_cancelled', taskId: id,
      message: `Task "${task.title}" has been cancelled`,
      read: false, createdAt: serverTimestamp()
    })

    await updateDoc(doc(db, 'tasks', id), { status: 'cancelled', escrowStatus: task.escrowStatus === 'locked' ? 'refunded' : 'none' })
  }

  const handleNotifyCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this task?')) return
    const now = new Date()
    const taskStartTime = task.deadline?.toDate ? task.deadline.toDate() : new Date()
    const hoursDiff = (taskStartTime - now) / (1000 * 60 * 60)

    if (hoursDiff < 6) {
      alert('Warning: Canceling less than 6 hours before deadline may result in a penalty.')
      const proceed = window.confirm('Do you still want to cancel?')
      if (!proceed) return
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const currentPenalty = userSnap.data()?.penaltyPoints || 0
      await updateDoc(userRef, { penaltyPoints: currentPenalty + 1 })
      await addDoc(collection(db, 'penalties'), {
        taskId: id, userId: user.uid, reason: 'late_cancel', createdAt: serverTimestamp()
      })
    }

    await addDoc(collection(db, 'notifications'), {
      userId: task.ownerId, type: 'task_cancelled', taskId: id,
      message: `${profile?.name || user.displayName} has cancelled the task: ${task.title}`,
      read: false, createdAt: serverTimestamp()
    })
    await updateDoc(doc(db, 'tasks', id), { status: 'posted', assignedTo: null, escrowStatus: 'none' })
    alert('Task cancelled and owner notified')
  }

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This cannot be undone.')) return

    if (task.escrowStatus === 'locked') {
      const posterSnap = await getDoc(doc(db, 'users', user.uid))
      const posterBalance = posterSnap.data()?.walletBalance || 0
      await updateDoc(doc(db, 'users', user.uid), { walletBalance: posterBalance + task.escrowAmount })
      await addDoc(collection(db, 'transactions'), {
        fromId: 'escrow', toId: user.uid, amount: task.escrowAmount,
        type: 'escrow_refund', status: 'completed',
        receiptNo: 'DEL-REF-' + Date.now(),
        description: `Refund for deleted task: ${task.title}`,
        taskId: id, createdAt: serverTimestamp()
      })
    }

    await updateDoc(doc(db, 'tasks', id), { status: 'deleted' })
    alert('Task deleted')
    navigate('/my-tasks')
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) { alert('Please write a review comment'); return }
    if (reviewForm.comment.length < 10) { alert('Review must be at least 10 characters'); return }
    setSubmittingReview(true)
    try {
      const targetId = isOwner ? task.assignedTo : task.ownerId
      await addDoc(collection(db, 'reviews'), {
        taskId: id, taskTitle: task.title, fromId: user.uid, toId: targetId,
        fromName: profile?.name || user.displayName,
        fromPhoto: profile?.photoURL || user.photoURL || '',
        rating: Number(reviewForm.rating), comment: reviewForm.comment,
        role: isOwner ? 'buyer' : 'tasker', createdAt: serverTimestamp()
      })
      const updateField = isOwner ? { ownerReviewed: true } : { taskerReviewed: true }
      await updateDoc(doc(db, 'tasks', id), updateField)
      const targetUserRef = doc(db, 'users', targetId)
      const targetUserSnap = await getDoc(targetUserRef)
      const targetUserData = targetUserSnap.data()
      const currentRating = targetUserData?.rating || 0
      const currentReviewCount = targetUserData?.reviewCount || 0
      const newReviewCount = currentReviewCount + 1
      const newRating = ((currentRating * currentReviewCount) + Number(reviewForm.rating)) / newReviewCount
      await updateDoc(targetUserRef, { rating: newRating, reviewCount: newReviewCount })

      await addDoc(collection(db, 'notifications'), {
        userId: targetId, type: 'new_review', taskId: id,
        message: `${profile?.name || user.displayName} left you a ${reviewForm.rating}-star review`,
        read: false, createdAt: serverTimestamp()
      })

      setReviewForm({ rating: 5, comment: '' })
      alert('Review submitted successfully!')
    } catch (err) { alert(err.message) }
    finally { setSubmittingReview(false) }
  }

  if (taskLoading) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>
  if (!task) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Task not found</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={task.ownerName} src={task.ownerPhoto} size="lg" />
            <div>
              <p className="font-semibold">{task.ownerName}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.createdAt?.toDate ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true }) : ''}</p>
            </div>
          </div>
          <Badge variant={task.isUrgent ? 'danger' : 'primary'}>{task.status.replace('_', ' ')}</Badge>
        </div>

        <h1 className="text-xl font-bold mb-2">{task.title}</h1>
        <div className="flex flex-wrap gap-3 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1"><DollarSign size={16} /> Budget: ৳{task.budget}</span>
          <span className="flex items-center gap-1"><MapPin size={16} /> {task.areaName}</span>
          <Badge>{task.category}</Badge>
        </div>

        {task.escrowAmount > 0 && (
          <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: task.escrowStatus === 'locked' ? 'rgba(251,191,36,0.1)' : 'rgba(16,185,129,0.1)', borderColor: task.escrowStatus === 'locked' ? '#fbbf24' : '#10b981' }}>
            <div className="flex items-center gap-2 text-sm">
              <Wallet size={16} className={task.escrowStatus === 'locked' ? 'text-yellow-500' : 'text-green-500'} />
              <span className="font-medium">Escrow: ${task.escrowAmount} ({task.escrowStatus})</span>
            </div>
          </div>
        )}

        {deadline && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
              <span className="font-medium">Deadline: {deadline.toLocaleString()}</span>
            </div>
            {expiryDate && (
              <div className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                <AlertTriangle size={14} />
                <span>Expires on: {expiryDate.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {isExpired && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-semibold">
              <XCircle size={16} />
              <span>This task has expired</span>
            </div>
          </div>
        )}

        <p className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{task.description}</p>

        {task.photos?.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {task.photos.map((url, i) => (
              <img key={i} src={url} alt="" className="w-32 h-32 object-cover rounded-lg" />
            ))}
          </div>
        )}
      </Card>

      {isOwner && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Manage Task</h3>
          {task.status === 'posted' || task.status === 'in_bidding' ? (
            <div className="space-y-2">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{bids?.filter(b => b.status === 'pending').length || 0} pending bids</p>
              <Button onClick={handleDeleteTask} variant="danger" size="sm"><Trash2 size={14} /> Delete Task</Button>
            </div>
          ) : task.status === 'assigned' ? (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => handleStatusUpdate('in_progress')} size="sm">Start Progress</Button>
              <Button onClick={() => handleStatusUpdate('completed')} variant="secondary" size="sm">Mark Completed</Button>
              <Button onClick={handleCancelTask} variant="danger" size="sm"><XCircle size={16} /> Cancel</Button>
            </div>
          ) : task.status === 'in_progress' ? (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => handleStatusUpdate('completed')}>Mark Completed</Button>
              <Button onClick={handleCancelTask} variant="danger" size="sm"><XCircle size={16} /> Cancel</Button>
            </div>
          ) : task.status === 'completed' && canReview ? (
            <form onSubmit={handleReview} className="space-y-3">
              <h4 className="font-medium text-sm">Review Tasker</h4>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setReviewForm(prev => ({...prev, rating: n}))}>
                    <Star size={24} className={n <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                  </button>
                ))}
              </div>
              <Textarea value={reviewForm.comment} onChange={e => setReviewForm(prev => ({...prev, comment: e.target.value}))} placeholder="Write a review..." rows={2} />
              <Button type="submit" size="sm" disabled={submittingReview}>
                {submittingReview ? <Loader2 size={16} className="animate-spin" /> : 'Submit Review'}
              </Button>
            </form>
          ) : null}
        </Card>
      )}

      {!isOwner && task.status !== 'completed' && task.status !== 'cancelled' && task.status !== 'expired' && !isExpired && (
        <>
          {userBid ? (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Your bid: ৳{userBid.proposedPrice}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status: <Badge variant={userBid.status === 'pending' ? 'warning' : userBid.status === 'accepted' ? 'success' : 'danger'}>{userBid.status}</Badge></p>
                </div>
                {userBid.status === 'accepted' && (
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => handleStatusUpdate('in_progress')}>Start</Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/messages/${id}`)}><MessageSquare size={16} /> Chat</Button>
                    <Button size="sm" variant="danger" onClick={handleNotifyCancel}><XCircle size={16} /> Cancel</Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Place Your Bid</h3>
              <form onSubmit={handleBid} className="space-y-3">
                <Input type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)} placeholder="Your price ($)" min="1" required />
                <Textarea value={bidMsg} onChange={e => setBidMsg(e.target.value)} placeholder="Message to owner..." rows={2} />
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit Bid'}
                </Button>
              </form>
            </Card>
          )}
        </>
      )}

      {isOwner && bids?.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Bids ({bids.filter(b => b.status === 'pending').length})</h3>
          <div className="space-y-3">
            {bids.filter(b => b.status === 'pending').map(bid => (
              <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <div className="flex items-center gap-3">
                  <Avatar name={bid.bidderName} src={bid.bidderPhoto} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{bid.bidderName}</p>
                    <p className="text-sm text-primary font-semibold">৳{bid.proposedPrice}</p>
                    {bid.message && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{bid.message}</p>}
                  </div>
                </div>
                <Button size="sm" onClick={() => handleAcceptBid(bid.id)}><CheckCircle size={16} /> Accept</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {task.status === 'completed' && !isOwner && canReview && (
        <Card className="p-4">
          <form onSubmit={handleReview} className="space-y-3">
            <h3 className="font-semibold">Review Buyer</h3>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setReviewForm(prev => ({...prev, rating: n}))}>
                  <Star size={24} className={n <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                </button>
              ))}
            </div>
            <Textarea value={reviewForm.comment} onChange={e => setReviewForm(prev => ({...prev, comment: e.target.value}))} placeholder="Write a review..." rows={2} />
            <Button type="submit" size="sm" disabled={submittingReview}>
              {submittingReview ? <Loader2 size={16} className="animate-spin" /> : 'Submit Review'}
            </Button>
          </form>
        </Card>
      )}

      <Button variant="ghost" onClick={() => navigate(`/messages/${id}`)} className="w-full">
        <MessageSquare size={18} /> Chat about this task
      </Button>
    </div>
  )
}
