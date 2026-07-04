import { useState } from 'react'
import { X, Loader2, CheckCircle, Smartphone, Building2, ArrowRight } from 'lucide-react'
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Button, Input, Card } from './ui/index'

const BANKS = [
  'BRAC Bank', 'Dutch-Bangla Bank', 'Islami Bank Bangladesh', 'Sonali Bank',
  'Janata Bank', 'Agrani Bank', 'Rupali Bank', 'Prime Bank',
  'Eastern Bank', 'UCBL', 'Trust Bank', 'City Bank'
]

export default function PaymentModal({ isOpen, onClose, userId, onSuccess }) {
  const [method, setMethod] = useState(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    phone: '', amount: '', bank: '', accountNumber: '', transactionId: ''
  })

  if (!isOpen) return null

  const reset = () => {
    setMethod(null)
    setStep(1)
    setForm({ phone: '', amount: '', bank: '', accountNumber: '', transactionId: '' })
    setSuccess(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const simulatePayment = async () => {
    if (!form.amount || Number(form.amount) <= 0) return
    setLoading(true)

    await new Promise(r => setTimeout(r, 2000))

    const receiptNo = `${method.toUpperCase()}-${Date.now()}`
    const txId = method === 'bank'
      ? `TXN${Math.random().toString(36).slice(2, 10).toUpperCase()}`
      : `${method}${Math.random().toString().slice(2, 12)}`

    try {
      await addDoc(collection(db, 'transactions'), {
        fromId: userId,
        toId: userId,
        amount: Number(form.amount),
        type: `${method}_deposit`,
        status: 'completed',
        receiptNo,
        description: `${method === 'bkash' ? 'Bkash' : method === 'nagad' ? 'Nagad' : 'Bank'} payment simulation`,
        paymentMethod: method,
        paymentDetails: method === 'bank'
          ? { bank: form.bank, accountNumber: form.accountNumber }
          : { phone: form.phone },
        transactionId: txId,
        createdAt: serverTimestamp()
      })

      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      const currentBalance = userSnap.data().walletBalance || 0
      await updateDoc(userRef, { walletBalance: currentBalance + Number(form.amount) })

      setSuccess(true)
      setLoading(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      alert('Error: ' + err.message)
      setLoading(false)
    }
  }

  const methods = [
    { id: 'bkash', name: 'Bkash', color: '#E2136E', icon: Smartphone, desc: 'Pay with Bkash mobile wallet' },
    { id: 'nagad', name: 'Nagad', color: '#F6921E', icon: Smartphone, desc: 'Pay with Nagad mobile wallet' },
    { id: 'bank', name: 'Bank Transfer', color: '#1a56db', icon: Building2, desc: 'Pay via Bangladeshi bank' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <Card className="w-full max-w-md p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-semibold">Add Funds</h3>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h4 className="font-bold text-lg mb-2">Payment Successful!</h4>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              ৳{form.amount} has been added to your wallet
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              Method: {method === 'bkash' ? 'Bkash' : method === 'nagad' ? 'Nagad' : 'Bank Transfer'}
            </p>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : !method ? (
          <div className="p-4 space-y-3">
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Select payment method</p>
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => { setMethod(m.id); setStep(2) }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 hover:border-primary transition-all text-left"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: m.color + '15' }}>
                  <m.icon size={24} style={{ color: m.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: methods.find(m => m.id === method)?.color }}>
                {methods.find(m => m.id === method)?.name}
              </span>
              <ArrowRight size={12} />
              <span>Demo Payment</span>
            </div>

            {method !== 'bank' ? (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {method === 'bkash' ? 'Bkash' : 'Nagad'} Number
                </label>
                <Input
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Select Bank</label>
                  <select
                    value={form.bank}
                    onChange={e => setForm({...form, bank: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                    required
                  >
                    <option value="">Choose bank</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Account Number</label>
                  <Input
                    value={form.accountNumber}
                    onChange={e => setForm({...form, accountNumber: e.target.value})}
                    placeholder="Enter account number"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Amount (৳)</label>
              <Input
                type="number"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>

            <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
              This is a demo simulation. No real payment will be charged. Funds will be added instantly to your wallet.
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setMethod(null); reset() }} className="flex-1">Back</Button>
              <Button onClick={simulatePayment} disabled={loading || !form.amount} className="flex-1">
                {loading ? <Loader2 size={16} className="animate-spin" /> : `Pay ৳${form.amount || '0'}`}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
