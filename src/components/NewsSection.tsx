import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const API = 'https://functions.poehali.dev/a24517e2-7b9c-4e77-9a0b-5b481cb624d0';

interface NewsItem {
  id: number;
  title: string;
  body: string;
  tag: string;
  date: string;
}

interface Comment {
  id: number;
  parent_id: number | null;
  author: string;
  text: string;
  is_admin: boolean;
  date: string;
}

const TAG_COLORS: Record<string, string> = {
  'Акция': 'bg-accent/20 text-accent border-accent/40',
  'Новость': 'bg-secondary/20 text-secondary border-secondary/40',
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] || 'bg-muted text-muted-foreground border-border';
}

function buildTree(comments: Comment[]) {
  const map: Record<number, Comment & { replies: Comment[] }> = {};
  const roots: (Comment & { replies: Comment[] })[] = [];
  comments.forEach(c => { map[c.id] = { ...c, replies: [] }; });
  comments.forEach(c => {
    if (c.parent_id && map[c.parent_id]) map[c.parent_id].replies.push(map[c.id]);
    else roots.push(map[c.id]);
  });
  return roots;
}

type CommentTree = Comment & { replies: CommentTree[] };

interface CommentNodeProps {
  comment: CommentTree;
  onReply: (id: number, author: string) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
  depth?: number;
}

function CommentNode({ comment, onReply, onDelete, isAdmin, depth = 0 }: CommentNodeProps) {
  const deleted = comment.text === '[удалено]';
  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-border/60' : ''}`}>
      <div className={`rounded-xl p-4 mb-2 ${comment.is_admin ? 'bg-accent/10 border border-accent/30' : 'bg-card border border-border/50'}`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${comment.is_admin ? 'text-accent' : ''}`}>
              {comment.is_admin && <span className="mr-1">👑</span>}{comment.author}
            </span>
            {comment.is_admin && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full border border-accent/30">Администратор</span>}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{comment.date}</span>
        </div>
        <p className={`text-sm leading-relaxed ${deleted ? 'text-muted-foreground italic' : ''}`}>{comment.text}</p>
        {!deleted && (
          <div className="flex gap-3 mt-2">
            <button onClick={() => onReply(comment.id, comment.author)} className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
              <Icon name="CornerDownRight" size={12} />Ответить
            </button>
            {isAdmin && (
              <button onClick={() => onDelete(comment.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                <Icon name="Trash2" size={12} />Удалить
              </button>
            )}
          </div>
        )}
      </div>
      {comment.replies.map(r => (
        <CommentNode key={r.id} comment={r as CommentTree} onReply={onReply} onDelete={onDelete} isAdmin={isAdmin} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function NewsSection({ adminPassword }: { adminPassword: string }) {
  const isAdmin = Boolean(adminPassword);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; author: string } | null>(null);
  const [cForm, setCForm] = useState({ author: '', text: '' });
  const [sending, setSending] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [nForm, setNForm] = useState({ title: '', body: '', tag: 'Новость' });
  const [addingNews, setAddingNews] = useState(false);

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => setNews(d.news || []))
      .catch(() => {});
  }, []);

  const loadComments = useCallback(async (newsId: number) => {
    setCommentsLoading(true);
    try {
      const r = await fetch(`${API}?action=comments&news_id=${newsId}`);
      const d = await r.json();
      setComments(d.comments || []);
    } catch { setComments([]); }
    setCommentsLoading(false);
  }, []);

  const openNews = (id: number) => {
    setOpen(id);
    setReplyTo(null);
    setCForm({ author: '', text: '' });
    loadComments(id);
  };

  const closeNews = () => { setOpen(null); setComments([]); setReplyTo(null); };

  const submitComment = async () => {
    if (!cForm.author.trim() || !cForm.text.trim()) {
      toast({ title: 'Заполните имя и текст', variant: 'destructive' }); return;
    }
    setSending(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminPassword) headers['X-Admin-Password'] = adminPassword;
      const res = await fetch(`${API}?action=comment`, {
        method: 'POST', headers,
        body: JSON.stringify({ news_id: open, author: cForm.author, text: cForm.text, parent_id: replyTo?.id || null }),
      });
      const d = await res.json();
      if (d.comment) {
        setComments(prev => [...prev, d.comment]);
        setCForm({ author: '', text: '' });
        setReplyTo(null);
        toast({ title: 'Комментарий опубликован' });
      }
    } catch { toast({ title: 'Ошибка отправки', variant: 'destructive' }); }
    setSending(false);
  };

  const deleteComment = async (id: number) => {
    await fetch(`${API}?action=delete_comment&id=${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
      body: JSON.stringify({}),
    });
    setComments(prev => prev.map(c => c.id === id ? { ...c, text: '[удалено]' } : c));
    toast({ title: 'Комментарий удалён' });
  };

  const deleteNews = async (id: number) => {
    await fetch(`${API}?action=delete_news&id=${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
      body: JSON.stringify({}),
    });
    setNews(prev => prev.filter(n => n.id !== id));
    if (open === id) closeNews();
    toast({ title: 'Новость удалена' });
  };

  const addNews = async () => {
    if (!nForm.title.trim() || !nForm.body.trim()) {
      toast({ title: 'Заполните заголовок и текст', variant: 'destructive' }); return;
    }
    setAddingNews(true);
    try {
      const res = await fetch(`${API}?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
        body: JSON.stringify(nForm),
      });
      const d = await res.json();
      if (d.news) {
        setNews(prev => [d.news, ...prev]);
        setNForm({ title: '', body: '', tag: 'Новость' });
        setShowAddNews(false);
        toast({ title: 'Новость опубликована!' });
      } else {
        toast({ title: d.error || 'Ошибка', variant: 'destructive' });
      }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    setAddingNews(false);
  };

  const tree = buildTree(comments);
  const openItem = news.find(n => n.id === open);

  return (
    <section id="news" className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto">
        {/* Заголовок */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-accent uppercase tracking-[0.3em] text-xs mb-3">Новости и акции</p>
            <h2 className="font-display text-4xl md:text-6xl font-semibold">Что нового на заимке</h2>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowAddNews(v => !v)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6">
              <Icon name="Plus" size={18} className="mr-2" />
              {showAddNews ? 'Отмена' : 'Добавить новость'}
            </Button>
          )}
        </div>

        {/* Форма добавления новости (только для админа) */}
        {isAdmin && showAddNews && (
          <div className="bg-primary-foreground/5 border border-primary-foreground/20 rounded-3xl p-8 mb-10">
            <h3 className="font-display text-2xl font-semibold mb-5">Новая публикация</h3>
            <div className="flex gap-3 mb-4">
              {['Новость', 'Акция'].map(t => (
                <button key={t} onClick={() => setNForm(f => ({ ...f, tag: t }))}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${nForm.tag === t ? 'bg-accent border-accent text-accent-foreground' : 'border-primary-foreground/30 text-primary-foreground/70 hover:border-accent'}`}>
                  {t}
                </button>
              ))}
            </div>
            <Input value={nForm.title} onChange={e => setNForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Заголовок" className="mb-3 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-12" />
            <Textarea value={nForm.body} onChange={e => setNForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Текст новости..." className="mb-5 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 min-h-32" />
            <Button onClick={addNews} disabled={addingNews} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8">
              {addingNews ? 'Публикуем...' : 'Опубликовать'}
            </Button>
          </div>
        )}

        {/* Лента новостей */}
        {open === null ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.length === 0 && (
              <p className="text-primary-foreground/60 col-span-full text-center py-12">Новостей пока нет</p>
            )}
            {news.map(item => (
              <div key={item.id} className="group bg-primary-foreground/5 hover:bg-primary-foreground/10 border border-primary-foreground/15 hover:border-accent/50 rounded-2xl p-7 transition-all cursor-pointer flex flex-col"
                onClick={() => openNews(item.id)}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${tagColor(item.tag)}`}>{item.tag}</span>
                  <span className="text-xs text-primary-foreground/50">{item.date}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-accent transition-colors line-clamp-2">{item.title}</h3>
                <p className="text-primary-foreground/70 text-sm leading-relaxed line-clamp-3 flex-1">{item.body}</p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-primary-foreground/10">
                  <span className="text-accent text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Читать <Icon name="ArrowRight" size={14} />
                  </span>
                  {isAdmin && (
                    <button onClick={e => { e.stopPropagation(); deleteNews(item.id); }}
                      className="text-primary-foreground/40 hover:text-destructive transition-colors p-1">
                      <Icon name="Trash2" size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Открытая новость с комментариями */
          <div>
            <button onClick={closeNews} className="flex items-center gap-2 text-primary-foreground/70 hover:text-accent transition-colors mb-8 text-sm">
              <Icon name="ArrowLeft" size={16} />Назад к новостям
            </button>
            {openItem && (
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-5">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${tagColor(openItem.tag)}`}>{openItem.tag}</span>
                  <span className="text-xs text-primary-foreground/50">{openItem.date}</span>
                  {isAdmin && (
                    <button onClick={() => deleteNews(openItem.id)} className="ml-auto text-primary-foreground/40 hover:text-destructive transition-colors flex items-center gap-1 text-xs">
                      <Icon name="Trash2" size={14} />Удалить новость
                    </button>
                  )}
                </div>
                <h2 className="font-display text-3xl md:text-5xl font-semibold mb-6">{openItem.title}</h2>
                <p className="text-primary-foreground/80 text-lg leading-relaxed whitespace-pre-wrap mb-12">{openItem.body}</p>

                {/* Комментарии */}
                <div className="border-t border-primary-foreground/15 pt-10">
                  <h3 className="font-display text-2xl font-semibold mb-6">
                    Комментарии {comments.length > 0 && <span className="text-accent">({comments.length})</span>}
                  </h3>

                  {commentsLoading && <p className="text-primary-foreground/50 text-sm mb-6">Загружаем...</p>}

                  {tree.length > 0 && (
                    <div className="space-y-3 mb-8">
                      {tree.map(c => (
                        <CommentNode key={c.id} comment={c as CommentTree} isAdmin={isAdmin}
                          onReply={(id, author) => { setReplyTo({ id, author }); }}
                          onDelete={deleteComment} />
                      ))}
                    </div>
                  )}

                  {/* Форма комментария */}
                  <div className="bg-primary-foreground/5 border border-primary-foreground/15 rounded-2xl p-6">
                    {replyTo && (
                      <div className="flex items-center justify-between mb-3 text-sm text-accent bg-accent/10 px-4 py-2 rounded-lg border border-accent/20">
                        <span><Icon name="CornerDownRight" size={14} className="inline mr-1" />Ответ для <b>{replyTo.author}</b></span>
                        <button onClick={() => setReplyTo(null)} className="hover:text-primary-foreground"><Icon name="X" size={14} /></button>
                      </div>
                    )}
                    <Input value={cForm.author} onChange={e => setCForm(f => ({ ...f, author: e.target.value }))}
                      placeholder={isAdmin ? 'Администратор' : 'Ваше имя'}
                      className="mb-3 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-11" />
                    <Textarea value={cForm.text} onChange={e => setCForm(f => ({ ...f, text: e.target.value }))}
                      placeholder="Напишите комментарий..."
                      className="mb-4 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 min-h-24" />
                    <Button onClick={submitComment} disabled={sending}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-7">
                      {sending ? 'Отправляем...' : replyTo ? 'Ответить' : 'Оставить комментарий'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}