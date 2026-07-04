import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Mail, Lock, Loader2, Gift } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { Button, Input, Card } from '../../components/ui/index'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await signUp(email, password, name, referralCode)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src="/favicon.svg" alt="" className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-primary">My Proxy</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create your account</p>
        </div>

        {referralCode && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex items-center gap-2">
            <Gift size={16} className="text-primary" />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>You were invited! You'll both get ৳50 bonus.</span>
          </div>
        )}

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <Input type="text" value={name} onChange={e => setName(e.target.value)} className="pl-10" placeholder="John Doe" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" placeholder="Min 6 characters" required minLength={6} />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/auth" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  )
}
