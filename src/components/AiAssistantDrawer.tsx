import {AlertTriangle, BookOpen, Calendar, Loader2, Send, Stethoscope, X} from 'lucide-react';
import {useState, type FormEvent} from 'react';
import {MEDICAL_ARTICLES} from '../data/knowledgeData';
import {MEDICAL_SERVICES} from '../data/servicesData';
import {UI_COPY} from '../data/translations';
import type {AiAssistantResponse, ConsultationMode, Lang} from '../types/medical';

interface AiAssistantDrawerProps {
  lang: Lang;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenService: (serviceId: string) => void;
  onOpenArticle: (articleId: string) => void;
  onBookService: (serviceId: string, mode?: ConsultationMode) => void;
}

interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  structured?: AiAssistantResponse;
}

export function AiAssistantDrawer({
  lang,
  isOpen,
  onOpen,
  onClose,
  onOpenService,
  onOpenArticle,
  onBookService,
}: AiAssistantDrawerProps) {
  const t = UI_COPY[lang].aiAssistant;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [messages, setMessages] = useState<ChatEntry[]>([]);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatEntry = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: trimmed,
          lang,
          history: nextHistory.slice(-6).map((m) => ({role: m.role, text: m.text})),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || (lang === 'ar' ? 'تعذر الاتصال بالمساعد الطبي.' : 'Unable to reach AI assistant.'));
        return;
      }

      const structured = data as AiAssistantResponse;
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: structured.reply,
          structured,
        },
      ]);
    } catch {
      setErrorMsg(lang === 'ar' ? 'حدث خطأ في الشبكة.' : 'Network error connecting to AI assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <>
      {/* Compact Floating Launcher (kept small to respect mobile sticky budget) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-4 end-4 z-40 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#0B3C5D]/20 bg-[#0B3C5D] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#082c44] sm:bottom-6 sm:end-6 sm:text-sm"
        >
          <Stethoscope className="h-4 w-4 text-sky-200" />
          <span>{t.title}</span>
        </button>
      )}

      {/* Slide-Over Clinical Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-[1px]">
          <div
            role="dialog"
            aria-label={t.title}
            className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#0B3C5D] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <Stethoscope className="h-5 w-5 text-sky-200" />
                <div>
                  <h2 className="font-display text-base font-bold">{t.title}</h2>
                  <p className="text-xs text-sky-100">{t.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close AI Assistant"
                className="cursor-pointer rounded-lg p-1.5 text-sky-100 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Medical Disclaimer */}
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-600">
              {t.disclaimer}
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {lang === 'ar'
                      ? 'مرحباً بك في منصة د. معتصم النسور. يمكنك طرح أي سؤال صحي عام، وسأساعدك بمعلومات علمية موثوقة واقتراح الخدمات والمقالات المناسبة أو توجيهك لحجز الموعد.'
                      : 'Welcome to Dr. Motasem Alnsour’s clinical platform. Ask any general health question for evidence-based guidance, relevant services, and article recommendations.'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      {lang === 'ar' ? 'أمثلة شائعة:' : 'Suggested Questions:'}
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                      {t.quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => sendQuestion(prompt)}
                          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-start text-xs font-medium text-slate-800 hover:border-[#0369A1] hover:bg-slate-50"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#0B3C5D] text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {msg.structured && (
                    <div className="mt-2.5 w-full space-y-2.5">
                      {msg.structured.urgencyLevel === 'urgent' && (
                        <div className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-900">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                          <span>{t.urgentNotice}</span>
                        </div>
                      )}

                      {msg.structured.suggestedServiceIds.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                          <div className="text-xs font-bold text-[#0B3C5D]">{t.suggestedServices}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {msg.structured.suggestedServiceIds.map((sid) => {
                              const srv = MEDICAL_SERVICES.find((s) => s.id === sid);
                              if (!srv) return null;
                              return (
                                <button
                                  key={sid}
                                  type="button"
                                  onClick={() => {
                                    onOpenService(sid);
                                    onClose();
                                  }}
                                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-[#0369A1]"
                                >
                                  {srv.title[lang]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {msg.structured.suggestedArticleIds.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <BookOpen className="h-3.5 w-3.5 text-[#0369A1]" />
                            <span>{t.suggestedArticles}</span>
                          </div>
                          <div className="mt-2 space-y-1.5">
                            {msg.structured.suggestedArticleIds.map((aid) => {
                              const art = MEDICAL_ARTICLES.find((a) => a.id === aid);
                              if (!art) return null;
                              return (
                                <button
                                  key={aid}
                                  type="button"
                                  onClick={() => {
                                    onOpenArticle(aid);
                                    onClose();
                                  }}
                                  className="block w-full cursor-pointer text-start text-xs font-medium text-[#0369A1] hover:underline"
                                >
                                  {art.title[lang]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {msg.structured.shouldBook && (
                        <button
                          type="button"
                          onClick={() => {
                            onBookService(
                              msg.structured?.suggestedServiceIds[0] ?? MEDICAL_SERVICES[0].id,
                              msg.structured?.recommendedMode ?? 'online'
                            );
                            onClose();
                          }}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0B3C5D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#082c44]"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{t.bookNow}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0B3C5D]" />
                  <span>{t.thinking}</span>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#0369A1] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0B3C5D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#082c44] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{t.send}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
