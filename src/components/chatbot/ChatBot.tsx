import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Minimize2, Mic, MicOff, Volume2, Sparkles, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS_BY_LANG: Record<string, string[]> = {
  fr: [
    '💡 Comment réduire le MTTR ?',
    '📅 Planifier une maintenance préventive',
    '🔍 Analyser les pannes récurrentes',
    '📦 Optimiser le stock de pièces',
    '📊 Calculer le taux de disponibilité',
    '⚙️ Bonnes pratiques maintenance',
  ],
  en: [
    '💡 How to reduce MTTR?',
    '📅 Plan preventive maintenance',
    '🔍 Analyze recurring failures',
    '📦 Optimize spare parts stock',
    '📊 Calculate availability rate',
    '⚙️ Maintenance best practices',
  ],
  ar: [
    '💡 كيفية تقليل MTTR؟',
    '📅 تخطيط الصيانة الوقائية',
    '🔍 تحليل الأعطال المتكررة',
    '📦 تحسين مخزون قطع الغيار',
    '📊 حساب معدل التوفر',
    '⚙️ أفضل ممارسات الصيانة',
  ],
};

const WELCOME_MSG: Record<string, string> = {
  fr: '👋 Bonjour ! Je suis votre assistant GMAO intelligent. Comment puis-je vous aider aujourd\'hui ?\n\n🔧 **Maintenance** · 📊 **Analyses** · 💡 **Recommandations**',
  en: '👋 Hello! I\'m your intelligent CMMS assistant. How can I help you today?\n\n🔧 **Maintenance** · 📊 **Analytics** · 💡 **Recommendations**',
  ar: '👋 مرحبا! أنا مساعد GMAO الذكي الخاص بك. كيف يمكنني مساعدتك اليوم؟\n\n🔧 **الصيانة** · 📊 **التحليلات** · 💡 **التوصيات**',
};

const ChatBot = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'fr';
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MSG[lang] || WELCOME_MSG.fr },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = SUGGESTIONS_BY_LANG[lang] || SUGGESTIONS_BY_LANG.fr;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Reset welcome message on language change
  useEffect(() => {
    setMessages([{ role: 'assistant', content: WELCOME_MSG[lang] || WELCOME_MSG.fr }]);
  }, [lang]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
      if (event.results[0].isFinal) {
        setListening(false);
        sendMessage(transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleaned = text.replace(/[#*_`\[\]()]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: WELCOME_MSG[lang] || WELCOME_MSG.fr }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setLoading(true);

    let assistantSoFar = '';
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-chat`;
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, language: lang }),
      });

      if (resp.status === 429) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Trop de requêtes. Veuillez patienter quelques secondes.' }]);
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Crédits IA épuisés. Contactez l\'administrateur.' }]);
        setLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > allMessages.length) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "❌ Désolé, une erreur s'est produite. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!open) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), #ff6b2b)', boxShadow: '0 4px 20px rgba(30,144,255,0.4)' }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col"
        style={{ height: minimized ? 56 : 560, background: 'hsl(var(--background))', transition: 'height 0.3s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.1), hsl(var(--primary)/0.05))' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), #0050cc)' }}>
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                {t('chatbot.title', 'Assistant GMAO')} <Sparkles className="h-3.5 w-3.5 text-primary" />
              </p>
              <p className="text-[10px] text-green-500 font-medium">● {t('chatbot.online', 'En ligne — IA active')}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={resetChat} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors" title="Réinitialiser">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setMinimized(!minimized)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-md'
                      : 'bg-muted/60 border border-border rounded-tl-md text-foreground'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div>
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:my-1.5 [&_h2]:my-1 [&_h3]:my-1 [&_strong]:text-foreground [&_p]:text-foreground [&_li]:text-foreground [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:text-xs [&_blockquote]:border-primary/30 [&_blockquote]:text-muted-foreground">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <button onClick={() => speak(msg.content)}
                          className="mt-1.5 opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-muted-foreground"
                          title="Écouter">
                          <Volume2 className="h-3 w-3" /> {t('chatbot.listen', 'Écouter')}
                        </button>
                      </div>
                    ) : msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted/60 border border-border px-4 py-3 rounded-2xl rounded-tl-md">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs">{t('chatbot.thinking', 'Réflexion...')}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => sendMessage(s.replace(/^[^\s]+ /, ''))}
                    className="text-[11px] px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chatbot.placeholder', 'Posez votre question...')}
                  className="flex-1 h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  disabled={loading}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
                <motion.button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    listening ? 'bg-destructive/10 border-destructive text-destructive animate-pulse' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), #0050cc)' }}
                >
                  <Send className="h-4 w-4 text-white" />
                </motion.button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatBot;
