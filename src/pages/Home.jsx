import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, DollarSign, Users, Clock4, CheckCircle, TrendingUp, Star, Sparkles } from 'lucide-react'
import { orderBy, limit, where } from 'firebase/firestore'
import { useFirestoreRealtime } from '../hooks/useFirestore'
import { getRecommendedTasks } from '../lib/taskMatching'
import useAuthStore from '../store/authStore'
import useLanguage from '../store/languageStore'
import { Card, Badge, Avatar, Input, Select } from '../components/ui/index'
import { formatDistanceToNow } from 'date-fns'

const FALLBACK_CATEGORIES = [
  'All', 'Delivery', 'Photography', 'Document', 'Shopping', 'Pickup',
  'Cleaning', 'Moving', 'Repairs', 'Tutoring', 'Pet Care', 'Gardening', 'Other'
]

export default function Home() {
  const { user, profile } = useAuthStore()
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [recommended, setRecommended] = useState([])

  const { data: dbCategories } = useFirestoreRealtime('categories', [])
  const CATEGORIES = ['All', ...(dbCategories?.filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => c.name) || FALLBACK_CATEGORIES.slice(1))]

  const { data: allTasks, loading } = useFirestoreRealtime('tasks', [
    where('status', 'in', ['posted', 'in_bidding']),
    orderBy('createdAt', 'desc'),
    limit(20)
  ])

  const tasks = allTasks.filter(task => {
    if (!task.expiryDate?.toDate) return true
    return new Date() <= task.expiryDate.toDate()
  })

  useEffect(() => {
    if (user && profile) {
      getRecommendedTasks(user.uid, profile).then(setRecommended)
    }
  }, [user, profile, allTasks])

  const { data: featuredTasks } = useFirestoreRealtime('tasks', [
    where('isUrgent', '==', true),
    orderBy('createdAt', 'desc'),
    limit(5)
  ])

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || t.category === category
    return matchSearch && matchCategory
  })

  const stats = [
    { icon: Users, label: 'Active Users', value: '1,200+' },
    { icon: TrendingUp, label: 'Tasks Completed', value: '850+' },
    { icon: DollarSign, label: 'Money Earned', value: '৳15,400+' },
    { icon: Star, label: 'Average Rating', value: '4.8' }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('home.title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>{t('home.subtitle')}</p>
      </div>

      <section className="mb-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-3">
                <Icon size={32} className="text-primary" />
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-10" placeholder={t('home.search')} />
          </div>
          <Select value={category} onChange={e => setCategory(e.target.value)} className="sm:w-40">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select value={sort} onChange={e => setSort(e.target.value)} className="sm:w-40">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </Select>
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-primary" />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('home.recommended')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map(task => (
              <Link key={task.id} to={`/tasks/${task.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="primary" size="sm">{task.category}</Badge>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{task.matchScore}% match</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{task.title}</h3>
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1"><DollarSign size={12} />৳{task.budget}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />{task.areaName || 'Unknown'}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredTasks.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock4 size={20} className="text-danger" />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('home.urgentTasks')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTasks.map(task => (
              <Link key={task.id} to={`/tasks/${task.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-danger/20 bg-danger/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="danger" size="sm">URGENT</Badge>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Budget: ৳{task.budget}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</h3>
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={12} />
                    <span>{task.areaName || 'Unknown'}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('home.allTasks')}</h2>
          <Link to="/tasks/new" className="text-primary font-medium hover:underline">{t('home.postTask')}</Link>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">{t('home.loading')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <Search size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>{t('home.noTasks')}</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('home.beFirst')}</p>
            <Link to="/tasks/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              <CheckCircle size={16} /> {t('home.postTask')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(task => (
              <Link key={task.id} to={`/tasks/${task.id}`}>
                <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="primary" size="sm">{task.category}</Badge>
                    {task.isUrgent && <Badge variant="danger" size="sm">NEW</Badge>}
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors" style={{ color: 'var(--text-primary)' }}>{task.title}</h3>
                  <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} /> ৳{task.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {task.areaName || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {task.createdAt?.toDate ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={task.ownerName} src={task.ownerPhoto} size="sm" />
                      <span className="text-xs truncate max-w-24" style={{ color: 'var(--text-secondary)' }}>{task.ownerName}</span>
                    </div>
                    {task.ownerRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{task.ownerRating?.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
