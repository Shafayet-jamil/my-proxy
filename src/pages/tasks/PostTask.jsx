import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, MapPin, Calendar } from 'lucide-react'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db, storage } from '../../lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import useAuthStore from '../../store/authStore'
import { Button, Input, Textarea, Card, Select } from '../../components/ui/index'
import { useFirestoreRealtime } from '../../hooks/useFirestore'

export default function PostTask() {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category: '', budget: '',
    areaName: '', address: '', isUrgent: false, deadline: ''
  })
  const [photos, setPhotos] = useState([])

  const { data: categories } = useFirestoreRealtime('categories', [])
  const categoryNames = categories?.map(c => c.name) || []

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files)
    setPhotos(prev => [...prev, ...files])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.deadline) { alert('Please set a deadline'); return }
    const deadlineDate = new Date(form.deadline)
    if (deadlineDate <= new Date()) { alert('Deadline must be in the future'); return }
    setLoading(true)
    try {
      const photoURLs = []
      for (const file of photos) {
        const ref_path = ref(storage, `tasks/${user.uid}/${Date.now()}_${file.name}`)
        const snap = await uploadBytes(ref_path, file)
        const url = await getDownloadURL(snap.ref)
        photoURLs.push(url)
      }
      const expiryDate = new Date(deadlineDate)
      expiryDate.setDate(expiryDate.getDate() + 3)

      const docRef = await addDoc(collection(db, 'tasks'), {
        ...form,
        budget: Number(form.budget),
        deadline: Timestamp.fromDate(deadlineDate),
        expiryDate: Timestamp.fromDate(expiryDate),
        photos: photoURLs,
        ownerId: user.uid,
        ownerName: profile?.name || user.displayName,
        ownerPhoto: profile?.photoURL || user.photoURL || '',
        status: 'posted',
        escrowAmount: 0,
        escrowStatus: 'none',
        createdAt: serverTimestamp()
      })
      navigate(`/tasks/${docRef.id}`)
    } catch (err) { alert('Error: ' + err.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Post a New Task</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Title</label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Pick up my package from UPS" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe your task in detail..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Category</label>
              <Select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Budget ($)</label>
              <Input name="budget" type="number" min="1" value={form.budget} onChange={handleChange} placeholder="50" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              <MapPin size={16} className="inline mr-1" /> Area / Location
            </label>
            <Input name="areaName" value={form.areaName} onChange={handleChange} placeholder="e.g., Gulshan, Dhaka" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Address</label>
            <Textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Full address..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={16} className="inline mr-1" /> Task Deadline *
            </label>
            <Input name="deadline" type="datetime-local" value={form.deadline} onChange={handleChange} required min={new Date().toISOString().slice(0, 16)} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Task will expire 3 days after deadline if not completed</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Photos (optional)</label>
            <Input type="file" multiple accept="image/*" onChange={handlePhotos} />
            {photos.length > 0 && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{photos.length} file(s) selected</p>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isUrgent" checked={form.isUrgent} onChange={handleChange} className="rounded" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Mark as urgent</span>
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Post Task'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
