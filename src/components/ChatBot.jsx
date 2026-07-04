import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, ChevronRight, HelpCircle } from 'lucide-react'

const FAQ = [
  { q: 'How do I post a task?', a: 'Go to the "Post" tab in the bottom navigation. Fill in the title, description, category, budget, location, and deadline. You can also mark it as urgent.' },
  { q: 'How does bidding work?', a: 'When you post a task, other users (taskers) can see it and place bids with their proposed price. You review the bids and accept the one you like.' },
  { q: 'How do payments work?', a: 'When you accept a bid, funds are locked in escrow from your wallet. When the task is completed, funds are released to the tasker automatically.' },
  { q: 'How do I add funds to my wallet?', a: 'Go to the Wallet tab. You can add funds directly or use Bkash, Nagad, or Bank Transfer. All payments are simulated in demo mode.' },
  { q: 'What if the tasker doesn\'t show up?', a: 'You can cancel the task and report a no-show. The tasker will receive a penalty point, and your escrowed funds will be refunded.' },
  { q: 'How do reviews work?', a: 'After a task is completed, both the buyer and tasker can leave a review with a rating (1-5 stars) and a comment.' },
  { q: 'Can I cancel or delete a task?', a: 'Yes. If the task is not yet assigned, you can delete it. If assigned, you can cancel it. Escrowed funds are automatically refunded.' },
  { q: 'What are penalty points?', a: 'Penalty points are given for no-shows or late cancellations. High penalty points may limit your ability to use the platform.' },
]

const QUICK_ACTIONS = [
  { label: 'Post a Task', path: '/tasks/new' },
  { label: 'Browse Tasks', path: '/feed' },
  { label: 'My Wallet', path: '/wallet' },
  { label: 'My Bids', path: '/my-bids' },
]

function getBotResponse(input) {
  const lower = input.toLowerCase()

  const match = FAQ.find(f => {
    const words = f.q.toLowerCase().replace(/[^a-z ]/g, '').split(' ')
    return words.some(w => w.length > 3 && lower.includes(w))
  })
  if (match) return match.a

  if (lower.includes('post') || lower.includes('create') || lower.includes('new task'))
    return 'To post a new task, tap the "Post" tab in the bottom navigation. Fill in the title, description, category, budget, location, and deadline. You can also mark it as urgent to get faster bids!'
  if (lower.includes('bid') || lower.includes('offer') || lower.includes('price'))
    return 'Bidding is simple! Browse available tasks, find one you can do, and submit your proposed price. The task owner reviews all bids and picks the best one.'
  if (lower.includes('pay') || lower.includes('money') || lower.includes('fund') || lower.includes('wallet'))
    return 'Go to the Wallet tab to add funds. We support Bkash, Nagad, and Bank Transfer for Bangladeshi users. All payments are currently in demo/simulation mode.'
  if (lower.includes('bkash'))
    return 'Bkash payment: Enter your Bkash number and amount. You\'ll receive a simulated confirmation. Funds are added instantly to your wallet.'
  if (lower.includes('nagad'))
    return 'Nagad payment: Enter your Nagad number and amount. Similar to Bkash, you\'ll get a simulated confirmation. Funds appear in your wallet immediately.'
  if (lower.includes('bank') || lower.includes('transfer'))
    return 'Bank Transfer: Select your bank from 12 Bangladeshi banks, enter account details and amount. A demo transaction ID is generated.'
  if (lower.includes('cancel') || lower.includes('delete') || lower.includes('remove'))
    return 'You can cancel or delete a task from the task detail page. If the task is assigned, cancel will refund escrowed funds. If not assigned, you can fully delete it.'
  if (lower.includes('review') || lower.includes('rating') || lower.includes('star'))
    return 'After a task is completed, both parties can leave a review. Go to the completed task and you\'ll see a review form. Rate 1-5 stars and write a comment.'
  if (lower.includes('chat') || lower.includes('message') || lower.includes('talk'))
    return 'You can chat with the task owner/tasker from the task detail page. Click the "Chat" button to start a conversation about the task.'
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    return 'Hello! Welcome to My Proxy. I\'m your assistant. How can I help you today?'
  if (lower.includes('thank'))
    return 'You\'re welcome! Feel free to ask if you have any other questions.'

  return 'I\'m not sure I understand. Could you rephrase? You can ask about:\n- Posting tasks\n- Bidding on tasks\n- Payments (Bkash/Nagad/Bank)\n- Reviews & ratings\n- Account & penalties'
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I\'m your My Proxy assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [showFAQ, setShowFAQ] = useState(false)
  const [activeFAQ, setActiveFAQ] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeFAQ])

  const handleSend = (text) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    setActiveFAQ(null)
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: getBotResponse(text) }])
    }, 400)
  }

  const handleFAQClick = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index)
  }

  const handleQuickAction = (path) => {
    window.location.href = path
    setIsOpen(false)
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-all hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-24 right-4 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            maxHeight: '70vh',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb'
          }}
        >
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">My Proxy Assistant</p>
                <p className="text-xs text-white/80">Online - Ready to help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
            style={{ minHeight: '200px', maxHeight: '300px', backgroundColor: '#f9fafb' }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className="p-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: msg.from === 'user' ? '#eef2ff' : '#e5e7eb' }}
                  >
                    {msg.from === 'user' ? <User size={14} className="text-primary" /> : <Bot size={14} className="text-gray-600" />}
                  </div>
                  <div
                    className="p-2.5 rounded-xl text-sm whitespace-pre-line"
                    style={{
                      backgroundColor: msg.from === 'user' ? '#4f46e5' : '#ffffff',
                      color: msg.from === 'user' ? '#ffffff' : '#1f2937',
                      borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      border: msg.from !== 'user' ? '1px solid #e5e7eb' : 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* FAQ Section */}
          {showFAQ && (
            <div
              className="border-t overflow-y-auto"
              style={{ maxHeight: '180px', backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
            >
              <div className="p-2 space-y-1">
                <p className="text-xs font-semibold px-2 py-1" style={{ color: '#6b7280' }}>Frequently Asked Questions</p>
                {FAQ.map((item, i) => (
                  <div key={i}>
                    <button
                      onClick={() => handleFAQClick(i)}
                      className="w-full text-left text-xs p-2.5 rounded-lg flex items-center justify-between transition-colors"
                      style={{
                        backgroundColor: activeFAQ === i ? '#eef2ff' : '#f9fafb',
                        color: '#1f2937',
                        border: activeFAQ === i ? '1px solid #c7d2fe' : '1px solid transparent'
                      }}
                    >
                      <span className="font-medium">{item.q}</span>
                      <ChevronRight
                        size={14}
                        style={{
                          color: '#9ca3af',
                          transform: activeFAQ === i ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </button>
                    {activeFAQ === i && (
                      <div
                        className="text-xs p-2.5 mx-1 mb-1 rounded-lg"
                        style={{ backgroundColor: '#f0fdf4', color: '#374151', border: '1px solid #bbf7d0' }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions + Input */}
          <div className="p-3 border-t" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
            {/* Quick action buttons */}
            <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action.path)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors"
                  style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={() => setShowFAQ(!showFAQ)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors"
                style={{ backgroundColor: showFAQ ? '#4f46e5' : '#f3f4f6', color: showFAQ ? '#ffffff' : '#6b7280' }}
              >
                <HelpCircle size={12} />
                {showFAQ ? 'Close FAQ' : 'FAQ'}
              </button>
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input) }} className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-sm px-3 py-2 rounded-xl outline-none"
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  color: '#1f2937'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-xl text-white transition-colors disabled:opacity-40"
                style={{ backgroundColor: '#4f46e5' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
