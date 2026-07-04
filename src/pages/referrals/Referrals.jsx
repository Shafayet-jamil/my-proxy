import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Copy, Share2, Users, CheckCircle, ExternalLink } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { doc, updateDoc, collection, query, where, getDocs, increment } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Card, Button, Input } from '../../components/ui/index'

function generateReferralCode(uid) {
  return `MP${uid.slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export default function Referrals() {
  const { user, profile } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [referralStats, setReferralStats] = useState(null)

  const referralCode = profile?.referralCode || generateReferralCode(user?.uid || '')
  const referralLink = `https://my-proxy-b15ee.web.app/signup?ref=${referralCode}`
  const referralCount = profile?.referralCount || 0
  const referralEarnings = profile?.referralEarnings || 0

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join My Proxy',
          text: `Use my referral code ${referralCode} to get ৳50 bonus!`,
          url: referralLink
        })
      } catch (e) {}
    } else {
      handleCopy()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Invite Friends, Earn Rewards</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Share your referral link and both of you get ৳50 bonus!</p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Referral Link</h2>
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <input readOnly value={referralLink} className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }} />
          <Button onClick={handleCopy} variant={copied ? 'success' : 'primary'} size="sm">
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleShare} className="flex-1"><Share2 size={16} /> Share</Button>
          <Button onClick={handleCopy} variant="outline" className="flex-1"><ExternalLink size={16} /> Copy Link</Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="p-6 text-center">
          <Users size={32} className="mx-auto mb-2 text-primary" />
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{referralCount}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Friends Referred</div>
        </Card>
        <Card className="p-6 text-center">
          <Gift size={32} className="mx-auto mb-2 text-success" />
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>৳{referralEarnings}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Referral Earnings</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h2>
        <div className="space-y-4">
          {[
            { step: 1, title: 'Share your link', desc: 'Send your referral link to friends and family' },
            { step: 2, title: 'Friend signs up', desc: 'They create an account using your link' },
            { step: 3, title: 'Both earn ৳50', desc: 'You both get ৳50 added to your wallets' }
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">{step}</div>
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
