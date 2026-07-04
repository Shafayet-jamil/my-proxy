import { useState } from 'react'
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Loader2, Send, AlertCircle } from 'lucide-react'
import { where, orderBy, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useFirestoreRealtime } from '../../hooks/useFirestore'
import useAuthStore from '../../store/authStore'
import { Button, Input, Card, Badge } from '../../components/ui/index'
import PaymentModal from '../../components/PaymentModal'

export default function Wallet() {
  const { user, profile } = useAuthStore()
  const { data: transactions } = useFirestoreRealtime('transactions', [
    where('fromId', 'in', [user.uid, 'escrow']),
    orderBy('createdAt', 'desc')
  ])
  const { data: incomingTx } = useFirestoreRealtime('transactions', [
    where('toId', '==', user.uid),
    orderBy('createdAt', 'desc')
  ])
  const [showPayment, setShowPayment] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [sendForm, setSendForm] = useState({ phone: '', amount: '', note: '' })
  const [sendLoading, setSendLoading] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError, setSendError] = useState('')

  const balance = profile?.walletBalance || 0

  const allTransactions = [...(transactions || []), ...(incomingTx || [])]
    .filter((tx, i, self) => i === self.findIndex(t => t.id === tx.id))
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0)
      const dateB = b.createdAt?.toDate?.() || new Date(0)
      return dateB - dateA
    })

  const handleSendMoney = async (e) => {
    e.preventDefault()
    setSendError('')

    const amount = Number(sendForm.amount)
    if (amount <= 0) { setSendError('Amount must be greater than 0'); return }
    if (amount > balance) { setSendError('Insufficient balance! Please add funds first.'); return }
    if (!sendForm.phone.trim()) { setSendError('Please enter a phone number'); return }

    setSendLoading(true)
    await new Promise(r => setTimeout(r, 1500))

    try {
      const receiptNo = 'SND-' + Date.now()

      await addDoc(collection(db, 'transactions'), {
        fromId: user.uid,
        toId: 'transfer',
        amount,
        type: 'send_money',
        status: 'completed',
        receiptNo,
        description: `Sent to ${sendForm.phone}${sendForm.note ? ': ' + sendForm.note : ''}`,
        paymentDetails: { phone: sendForm.phone, note: sendForm.note },
        createdAt: serverTimestamp()
      })

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const currentBalance = userSnap.data().walletBalance || 0
      await updateDoc(userRef, { walletBalance: currentBalance - amount })

      setSendSuccess(true)
      setSendLoading(false)
    } catch (err) {
      setSendError('Error: ' + err.message)
      setSendLoading(false)
    }
  }

  const resetSend = () => {
    setShowSend(false)
    setSendForm({ phone: '', amount: '', note: '' })
    setSendSuccess(false)
    setSendError('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#eef2ff' }}>
            <WalletIcon size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-sm" style={{ color: '#6b7280' }}>Wallet Balance</p>
            <p className="text-3xl font-bold" style={{ color: '#4f46e5' }}>৳{balance}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setShowPayment(true)} className="w-full">
            <Plus size={16} /> Add Funds
          </Button>
          <Button variant="outline" onClick={() => setShowSend(true)} className="w-full">
            <Send size={16} /> Send Money
          </Button>
        </div>
      </Card>

      {/* Send Money Modal */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Card className="w-full max-w-md p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="font-semibold">Send Money</h3>
              <button onClick={resetSend} className="p-1 rounded-full hover:bg-gray-100">
                <span style={{ color: '#6b7280' }}><span>&times;</span></span>
              </button>
            </div>

            {sendSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg mb-2">Money Sent!</h4>
                <p className="text-sm mb-1" style={{ color: '#374151' }}>
                  ৳{sendForm.amount} sent to {sendForm.phone}
                </p>
                <p className="text-xs mb-6" style={{ color: '#9ca3af' }}>
                  New balance: ৳{balance - Number(sendForm.amount)}
                </p>
                <Button onClick={resetSend} className="w-full">Done</Button>
              </div>
            ) : (
              <form onSubmit={handleSendMoney} className="p-4 space-y-4">
                {/* Balance display */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p className="text-xs" style={{ color: '#166534' }}>Available Balance</p>
                  <p className="text-xl font-bold" style={{ color: '#166534' }}>৳{balance}</p>
                </div>

                {sendError && (
                  <div className="p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600">{sendError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Recipient Phone Number</label>
                  <Input
                    value={sendForm.phone}
                    onChange={e => { setSendForm({...sendForm, phone: e.target.value}); setSendError('') }}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Amount (৳)</label>
                  <Input
                    type="number"
                    value={sendForm.amount}
                    onChange={e => { setSendForm({...sendForm, amount: e.target.value}); setSendError('') }}
                    placeholder="Enter amount"
                    min="1"
                    max={balance}
                    required
                  />
                  {sendForm.amount && Number(sendForm.amount) > balance && (
                    <p className="text-xs mt-1 text-red-500">Amount exceeds your balance</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Note (optional)</label>
                  <Input
                    value={sendForm.note}
                    onChange={e => setSendForm({...sendForm, note: e.target.value})}
                    placeholder="What's this for?"
                  />
                </div>

                <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
                  This is a demo simulation. No real money will be transferred.
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={resetSend} className="flex-1">Cancel</Button>
                  <Button
                    type="submit"
                    disabled={sendLoading || !sendForm.amount || !sendForm.phone || Number(sendForm.amount) > balance}
                    className="flex-1"
                  >
                    {sendLoading ? <Loader2 size={16} className="animate-spin" /> : `Send ৳${sendForm.amount || '0'}`}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h2 className="font-semibold mb-4">Transaction History</h2>
        {allTransactions.length === 0 ? (
          <p className="text-sm" style={{ color: '#9ca3af' }}>No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {allTransactions.map(tx => {
              const isCredit = ['deposit', 'stripe_deposit', 'escrow_release', 'payment', 'bkash_deposit', 'nagad_deposit', 'bank_deposit'].includes(tx.type)
              return (
                <Card key={tx.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: isCredit ? '#dcfce7' : '#fef2f2' }}>
                      {isCredit ? (
                        <ArrowDownLeft size={18} className="text-green-500" />
                      ) : (
                        <ArrowUpRight size={18} className="text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{tx.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>Receipt: {tx.receiptNo}</p>
                      {tx.description && <p className="text-xs" style={{ color: '#9ca3af' }}>{tx.description}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: isCredit ? '#16a34a' : '#dc2626' }}>
                      {isCredit ? '+' : '-'}৳{tx.amount}
                    </p>
                    <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm">{tx.status}</Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        userId={user.uid}
      />
    </div>
  )
}
