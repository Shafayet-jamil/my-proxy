import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ClipboardList, Calendar, CheckCircle2, Edit2, Save, X, Upload } from 'lucide-react'
import { where, orderBy, updateDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import { useRealtimeDoc, useFirestoreRealtime } from '../../hooks/useFirestore'
import useAuthStore from '../../store/authStore'
import { Card, Avatar, Badge, Stars, Select, Input, Textarea, Button } from '../../components/ui/index'

export default function Profile() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '', phone: '', location: '', skills: '' })
  const [uploading, setUploading] = useState(false)

  const { data: profile, loading } = useRealtimeDoc('users', id)
  const { data: reviews } = useFirestoreRealtime('reviews', [
    where('toId', '==', id), orderBy('createdAt', 'desc')
  ])
  const { data: givenTasks } = useFirestoreRealtime('tasks', [
    where('ownerId', '==', id), orderBy('createdAt', 'desc')
  ])
  const { data: completedTasks } = useFirestoreRealtime('tasks', [
    where('assignedTo', '==', id), orderBy('createdAt', 'desc')
  ])

  if (loading) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>
  if (!profile) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>User not found</div>

  const isOwnProfile = user?.uid === id

  const filterByMonth = (tasks) => {
    if (!tasks) return []
    return tasks.filter(task => {
      const taskDate = task.createdAt?.toDate ? task.createdAt.toDate() : null
      if (!taskDate) return false
      return taskDate.getMonth() === selectedMonth && taskDate.getFullYear() === selectedYear
    })
  }

  const monthlyGivenTasks = filterByMonth(givenTasks)
  const monthlyCompletedTasks = filterByMonth(completedTasks)
  const monthlyGivenCount = monthlyGivenTasks.length
  const monthlyCompletedCount = monthlyCompletedTasks.filter(t => t.status === 'completed').length
  const monthlyEarnings = monthlyCompletedTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.budget || 0), 0)
  const monthlySpent = monthlyGivenTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.budget || 0), 0)

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const handleEditClick = () => {
    setEditForm({ name: profile.name || '', bio: profile.bio || '', phone: profile.phone || '', location: profile.location || '', skills: profile.skills || '' })
    setIsEditing(true)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const photoRef = ref(storage, `profiles/${user.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(photoRef, file)
      const photoURL = await getDownloadURL(photoRef)
      await updateDoc(doc(db, 'users', user.uid), { photoURL })
      alert('Profile photo updated!')
    } catch (err) { alert('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: editForm.name, bio: editForm.bio, phone: editForm.phone,
        location: editForm.location, skills: editForm.skills
      })
      setIsEditing(false)
      alert('Profile updated!')
    } catch (err) { alert('Error: ' + err.message) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex justify-end mb-4">
          {isOwnProfile && !isEditing && (
            <Button size="sm" variant="secondary" onClick={handleEditClick}>
              <Edit2 size={16} /> Edit Profile
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveProfile}><Save size={16} /> Save</Button>
              <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}><X size={16} /> Cancel</Button>
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar name={profile.name} src={profile.photoURL} size="lg" className="mx-auto mb-3" />
            {isOwnProfile && !isEditing && (
              <label className="absolute bottom-2 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark transition-colors">
                <Upload size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Name</label>
                <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Bio</label>
                <Textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Tell us about yourself..." rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Phone</label>
                <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Location</label>
                <Input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Skills (comma separated)</label>
                <Input value={editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})} placeholder="Photography, Delivery, Tutoring" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
              {profile.bio && <p className="text-sm max-w-md mx-auto mb-3 italic" style={{ color: 'var(--text-secondary)' }}>"{profile.bio}"</p>}
              {profile.location && <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{profile.location}</p>}
              {profile.phone && <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{profile.phone}</p>}
              {profile.skills && (
                <div className="flex flex-wrap gap-2 justify-center mt-3 mb-3">
                  {profile.skills.split(',').map((skill, i) => (
                    <Badge key={i} variant="primary" size="sm">{skill.trim()}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mt-3">
                <Stars rating={profile.rating || 0} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({profile.reviewCount || 0} reviews)</span>
              </div>
              <div className="mt-4 text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div>Wallet Balance: <span className="font-semibold text-primary">৳{profile.walletBalance || 0}</span></div>
                {(profile.penaltyPoints || 0) > 0 && (
                  <div className="text-danger">Penalty Points: <span className="font-semibold">{profile.penaltyPoints}</span></div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {isOwnProfile && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Monthly Report
            </h2>
            <div className="flex gap-2">
              <Select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="text-sm">
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </Select>
              <Select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="text-sm">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList size={18} className="text-blue-600 dark:text-blue-400" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tasks Posted</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{monthlyGivenCount}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total spent: ৳{monthlySpent}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tasks Completed</p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{monthlyCompletedCount}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total earned: ৳{monthlyEarnings}</p>
            </div>
          </div>
          <div className="space-y-3">
            {monthlyGivenTasks.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-2">Posted Tasks This Month</h3>
                <div className="space-y-1">
                  {monthlyGivenTasks.map(task => (
                    <Link key={task.id} to={`/tasks/${task.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:opacity-80 transition-colors" style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <span className="text-sm truncate flex-1">{task.title}</span>
                        <Badge variant={task.status === 'completed' ? 'success' : 'warning'} size="sm">{task.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {monthlyCompletedTasks.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-2">Completed as Tasker This Month</h3>
                <div className="space-y-1">
                  {monthlyCompletedTasks.map(task => (
                    <Link key={task.id} to={`/tasks/${task.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:opacity-80 transition-colors" style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <span className="text-sm truncate flex-1">{task.title}</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">৳{task.budget}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {monthlyGivenTasks.length === 0 && monthlyCompletedTasks.length === 0 && (
              <p className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>No activity this month</p>
            )}
          </div>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Reviews ({reviews.length})</h2>
          {reviews.length > 0 && (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Average: <span className="font-semibold text-yellow-600">{(profile.rating || 0).toFixed(1)} stars</span>
            </div>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  <Avatar name={r.fromName} src={r.fromPhoto} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link to={`/profile/${r.fromId}`} className="font-medium text-sm hover:underline">{r.fromName}</Link>
                      <Stars rating={r.rating} />
                      <Badge variant={r.role === 'buyer' ? 'primary' : 'success'} size="sm">{r.role}</Badge>
                    </div>
                    {r.taskTitle && (
                      <Link to={`/tasks/${r.taskId}`} className="text-xs hover:underline block mb-1" style={{ color: 'var(--text-muted)' }}>
                        Task: {r.taskTitle}
                      </Link>
                    )}
                    {r.comment && <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{r.comment}</p>}
                    {r.createdAt?.toDate && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{r.createdAt.toDate().toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
