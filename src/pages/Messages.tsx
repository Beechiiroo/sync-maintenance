import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, User, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface Profile { id: string; full_name: string | null; email: string | null; avatar_url: string | null }
interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerEmail: string | null;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
}

const Messages = () => {
  const { t } = useTranslation();
  const { userId } = useUserRole();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchProfiles = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    const missing = ids.filter(id => !profiles[id]);
    if (!missing.length) return;
    const { data } = await supabase.from('profiles').select('id,full_name,email,avatar_url').in('id', missing);
    if (data) {
      setProfiles(prev => {
        const next = { ...prev };
        (data as Profile[]).forEach(p => { next[p.id] = p; });
        return next;
      });
    }
  }, [profiles]);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    setLoadingConvs(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erreur chargement messages'); setLoadingConvs(false); return; }
    const msgs = (data as Message[]) || [];
    // Build conversation map
    const map = new Map<string, Conversation>();
    for (const m of msgs) {
      const partnerId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      if (!map.has(partnerId)) {
        map.set(partnerId, {
          partnerId,
          partnerName: partnerId,
          partnerEmail: null,
          lastMessage: m.content,
          lastAt: m.created_at,
          unreadCount: (!m.read && m.receiver_id === userId) ? 1 : 0,
        });
      } else {
        const c = map.get(partnerId)!;
        if (!m.read && m.receiver_id === userId) c.unreadCount++;
      }
    }
    // Fetch partner profiles
    const partnerIds = Array.from(map.keys());
    if (partnerIds.length) {
      const { data: profileData } = await supabase.from('profiles').select('id,full_name,email,avatar_url').in('id', partnerIds);
      if (profileData) {
        (profileData as Profile[]).forEach(p => {
          setProfiles(prev => ({ ...prev, [p.id]: p }));
          const c = map.get(p.id);
          if (c) { c.partnerName = p.full_name || p.email || p.id; c.partnerEmail = p.email; }
        });
      }
    }
    setConversations(Array.from(map.values()));
    setLoadingConvs(false);
  }, [userId]);

  const fetchThread = useCallback(async (partnerId: string) => {
    if (!userId) return;
    setLoadingThread(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    if (error) { toast.error('Erreur chargement thread'); setLoadingThread(false); return; }
    setMessages((data as Message[]) || []);
    setLoadingThread(false);
    // Mark unread as read
    const unreadIds = ((data as Message[]) || []).filter(m => !m.read && m.receiver_id === userId).map(m => m.id);
    if (unreadIds.length) {
      await supabase.from('messages').update({ read: true }).in('id', unreadIds);
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (selectedPartnerId) fetchThread(selectedPartnerId);
  }, [selectedPartnerId, fetchThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
        filter: `receiver_id=eq.${userId}` },
        (payload) => {
          fetchConversations();
          if (selectedPartnerId && payload.new.sender_id === selectedPartnerId) {
            setMessages(prev => [...prev, payload.new as Message]);
            supabase.from('messages').update({ read: true }).eq('id', payload.new.id);
          }
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
        filter: `sender_id=eq.${userId}` },
        (payload) => {
          if (selectedPartnerId && payload.new.receiver_id === selectedPartnerId) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
          fetchConversations();
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, selectedPartnerId, fetchConversations]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedPartnerId || !userId) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: selectedPartnerId,
      content: newMsg.trim(),
      read: false,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setNewMsg('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const selectedConv = conversations.find(c => c.partnerId === selectedPartnerId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          {t('messages.title', 'Messagerie')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t('messages.subtitle', 'Communications en temps réel')}</p>
      </div>

      {/* Split layout */}
      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left: conversation list */}
        <Card className="glass-card border-border/50 w-72 shrink-0 flex flex-col">
          <div className="p-3 border-b border-border/50">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('messages.conversations', 'Conversations')}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">{t('messages.noConversations', 'Aucune conversation')}</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.partnerId}
                  onClick={() => setSelectedPartnerId(conv.partnerId)}
                  className={cn(
                    'w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors border-b border-border/30',
                    selectedPartnerId === conv.partnerId && 'bg-primary/10 border-l-2 border-l-primary'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
                    {conv.partnerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{conv.partnerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Right: thread */}
        <Card className="glass-card border-border/50 flex-1 flex flex-col">
          {!selectedPartnerId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MessageSquare className="h-16 w-16 opacity-20" />
              <p className="text-sm">{t('messages.selectConv', 'Sélectionnez une conversation')}</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="p-4 border-b border-border/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-semibold">
                  {selectedConv?.partnerName.charAt(0).toUpperCase() ?? <User className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{selectedConv?.partnerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedConv?.partnerEmail}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-emerald-400">
                  <Circle className="h-2 w-2 fill-current" />
                  <span className="text-xs">En ligne</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingThread ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    {t('messages.noMessages', 'Aucun message. Commencez la conversation !')}
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === userId;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                        >
                          <div className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                            isMine
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-muted text-foreground rounded-tl-sm'
                          )}>
                            <p>{msg.content}</p>
                            <p className={cn('text-[10px] mt-1', isMine ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              {isMine && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/50 flex gap-2">
                <Input
                  placeholder={t('messages.placeholder', 'Écrivez un message…')}
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 glass-card border-border/50"
                />
                <Button onClick={handleSend} disabled={sending || !newMsg.trim()} size="icon" className="shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
