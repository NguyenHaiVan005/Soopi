import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ShoppingCart, Loader2, Sparkles } from 'lucide-react';
import { formatVND } from '../utils/format';

const WELCOME_MSG = {
  id: 0,
  role: 'assistant',
  text: 'Xin chào! 👋 Mình là trợ lý mua sắm AI của Soopi.\n\nMình có thể giúp bạn tìm sản phẩm, so sánh giá, hoặc tư vấn mua hàng. Bạn cần tìm gì hôm nay?',
  products: [],
};

const QUICK_QUESTIONS = [
  'Tai nghe chống ồn tốt nhất?',
  'Điện thoại dưới 15 triệu?',
  'Sản phẩm bán chạy nhất?',
  'Đồ gia dụng giá tốt?',
];

export default function ChatBot({ onAddToCart }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.reply || 'Xin lỗi, có lỗi xảy ra.',
        products: data.products || [],
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Xin lỗi, mình đang gặp sự cố kết nối. Bạn thử lại sau nhé! 🙏',
        products: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-soopi-500 hover:bg-soopi-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Mở chatbot AI"
      >
        {open ? <X size={24} /> : (
          <div className="relative">
            <MessageCircle size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] h-[520px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-soopi-500 to-orange-400 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">Trợ lý Soopi AI</div>
              <div className="text-white/80 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" />
                Đang hoạt động
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-soopi-500' : 'bg-gradient-to-br from-orange-400 to-soopi-500'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className="text-white" />
                  }
                </div>

                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-soopi-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Product suggestions */}
                  {msg.products?.length > 0 && (
                    <div className="w-full space-y-1.5 mt-1">
                      <p className="text-xs text-gray-400 font-medium">Sản phẩm gợi ý:</p>
                      {msg.products.map(p => (
                        <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm">
                          <p className="text-xs font-medium text-gray-800 line-clamp-2">{p.name}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <div>
                              <span className="text-soopi-500 font-bold text-xs">{formatVND(p.price)}</span>
                              {p.original_price > p.price && (
                                <span className="text-gray-400 text-xs line-through ml-1">{formatVND(p.original_price)}</span>
                              )}
                            </div>
                            {onAddToCart && (
                              <button
                                onClick={() => onAddToCart(p)}
                                className="flex items-center gap-1 text-xs bg-soopi-50 text-soopi-600 hover:bg-soopi-100 px-2 py-1 rounded-lg font-medium transition-colors"
                              >
                                <ShoppingCart size={11} />
                                Thêm
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-soopi-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions (only at start) */}
          {messages.length === 1 && !loading && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-hide">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-xs bg-white border border-soopi-200 text-soopi-600 hover:bg-soopi-50 px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi mình về sản phẩm..."
              rows={1}
              className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-soopi-300 focus:border-soopi-400 max-h-24 scrollbar-hide"
              style={{ lineHeight: '1.4' }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-soopi-500 hover:bg-soopi-600 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

