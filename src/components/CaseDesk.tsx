import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Search, ChevronDown, Flame, Target, ArrowRight, X, Check, Paperclip } from 'lucide-react';
import { SCAM_CASES, type ScamCase, type InvestigativeClue } from '../data/scamsData';
import { generateDynamicScamCase } from '../data/dynamicScamsGenerator';
import { sound } from '../utils/audio';
import { PhoneScreen } from './PhoneScreen';

interface CaseDeskProps {
  onScoreUpdate: (totalXp: number, completedCount: number, allCompleted: boolean) => void;
}

type Verdict = 'scam' | 'safe';

const CLUE_XP = 10;

const comboBonusFor = (streak: number) => (streak >= 3 ? 30 : streak === 2 ? 10 : 0);

// nivel de ameaca visivel pro jogador (o DDA do gerador sobe junto com o streak)
const threatLevel = (streak: number) => Math.min(5, 1 + Math.floor(streak / 2));

export const CaseDesk: React.FC<CaseDeskProps> = ({ onScoreUpdate }) => {
  const [caseNumber, setCaseNumber] = useState(1);
  const [current, setCurrent] = useState<ScamCase>(() => generateDynamicScamCase(0));
  const [openClue, setOpenClue] = useState<string | null>(null);
  const [inspected, setInspected] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [solved, setSolved] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastEarned, setLastEarned] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const answered = verdict !== null;
  const wasCorrect = answered ? (verdict === 'scam') === current.isScam : null;

  const inspect = (clue: InvestigativeClue) => {
    sound.playBlip();
    setOpenClue((prev) => (prev === clue.id ? null : clue.id));
    if (!inspected.includes(clue.id)) setInspected((prev) => [...prev, clue.id]);
  };

  const decide = useCallback(
    (v: Verdict) => {
      if (answered) return;
      const correct = (v === 'scam') === current.isScam;
      setVerdict(v);
      setOpenClue(null);

      let earned = 0;
      let newStreak = 0;
      if (correct) {
        newStreak = streak + 1;
        earned = current.xpReward + inspected.length * CLUE_XP + comboBonusFor(newStreak);
        sound.playSuccess();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#ffd84a', '#1fa463', '#f4ede0', '#e23d3d'] });
      } else {
        sound.playError();
      }

      const newTotal = totalXp + earned;
      const newSolved = solved + 1;
      setStreak(newStreak);
      setLastEarned(earned);
      setTotalXp(newTotal);
      setSolved(newSolved);
      if (correct) setCorrectCount((n) => n + 1);
      onScoreUpdate(newTotal, newSolved, newSolved >= SCAM_CASES.length);

      // no celular o resultado fica embaixo do aparelho, entao rola ate ele
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 450);
    },
    [answered, current, inspected.length, onScoreUpdate, solved, streak, totalXp],
  );

  const nextCase = useCallback(() => {
    sound.playBlip();
    setCurrent(generateDynamicScamCase(streak));
    setCaseNumber((n) => n + 1);
    setVerdict(null);
    setOpenClue(null);
    setInspected([]);
    setLastEarned(0);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [streak]);

  // atalhos de teclado: G = golpe, S = seguro, Enter = proximo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (!answered && k === 'g') decide('scam');
      else if (!answered && k === 's') decide('safe');
      else if (answered && k === 'enter') nextCase();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, decide, nextCase]);

  const accuracy = solved ? Math.round((correctCount / solved) * 100) : null;
  const threat = threatLevel(streak);

  return (
    <div ref={topRef} className="scroll-mt-16 pb-28 lg:pb-10">
      {/* HUD do detetive */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="font-mono text-[12px] tracking-[0.2em] text-clip uppercase">
          Caso <span className="text-white">#{String(caseNumber).padStart(3, '0')}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-desk-2 border border-desk-line" title="Nível de ameaça: sobe quando você acerta em sequência">
            <span className="text-clip text-[11px] uppercase tracking-wider font-mono">Ameaça</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`w-1.5 h-3.5 rounded-sm ${i <= threat ? 'bg-scam' : 'bg-desk-line'}`} />
              ))}
            </div>
          </div>
          <motion.div
            key={streak}
            initial={{ scale: streak ? 1.25 : 1 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${streak >= 2 ? 'bg-[#ff8a3d]/15 border-[#ff8a3d]/40 text-[#ffb27a]' : 'bg-desk-2 border-desk-line text-clip'}`}
          >
            <Flame className="w-4 h-4" />
            <span className="font-semibold">{streak}</span>
          </motion.div>
          {accuracy !== null && (
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-desk-2 border border-desk-line text-clip">
              <Target className="w-4 h-4" />
              <span className="font-semibold text-white">{accuracy}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        {/* a fase: o celular */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ y: 40, opacity: 0, rotate: -2 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -30, opacity: 0, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="lg:sticky lg:top-16"
          >
            <PhoneScreen scamCase={current} stamped={verdict} wasCorrect={wasCorrect} />
          </motion.div>
        </AnimatePresence>

        {/* ficha do caso */}
        <motion.section
          key={`ficha-${current.id}`}
          initial={{ x: 30, opacity: 0, rotate: 1.2 }}
          animate={{ x: 0, opacity: 1, rotate: 0.4 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.08 }}
          className="paper relative rounded-[6px] px-5 sm:px-8 pt-8 pb-7"
        >
          <Paperclip className="absolute -top-4 left-8 w-8 h-8 text-clip rotate-[-20deg]" aria-hidden />

          <header className="flex items-start justify-between gap-4 border-b-2 border-dashed border-ink/20 pb-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink-soft">Ficha do caso</div>
              <h2 className="font-display font-extrabold text-[26px] sm:text-[30px] leading-[1.05] tracking-tight mt-1">
                {current.category}
              </h2>
            </div>
            <div className="font-mono text-[11px] text-ink-soft text-right leading-5 shrink-0">
              Recebido às {current.time}
              <br />
              Canal: {current.channel === 'push' ? 'notificação' : current.channel === 'call' ? 'ligação' : current.channel.toUpperCase()}
            </div>
          </header>

          <p className="mt-4 text-[16px] leading-[1.55] text-ink">{current.dilemma}</p>

          {/* ferramentas de investigacao */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink-soft">Investigar antes de carimbar</h3>
              <span className="font-mono text-[11px] text-ink-soft">+{CLUE_XP} XP cada</span>
            </div>
            <ul className="mt-3 space-y-2">
              {current.clues.map((clue, idx) => {
                const isOpen = openClue === clue.id;
                const seen = inspected.includes(clue.id);
                const suspicious = clue.evidenceResult.status === 'suspicious';
                return (
                  <li key={clue.id} className="rounded-md border-2 border-ink/15 bg-white/55 overflow-hidden">
                    <button
                      onClick={() => inspect(clue)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-white/70 transition cursor-pointer"
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[12px] font-semibold shrink-0 ${seen ? 'bg-ink text-paper' : 'border-2 border-ink/30 text-ink-soft'}`}>
                        {seen ? <Search className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <span className="flex-1 font-semibold text-[15px]">{clue.buttonLabel}</span>
                      {answered && (
                        <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${suspicious ? 'bg-scam/15 text-scam' : 'bg-safe/15 text-safe'}`}>
                          {suspicious ? 'suspeito' : 'ok'}
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-ink-soft transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 border-t border-dashed border-ink/15">
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-soft mt-2">{clue.inspection.badge}</div>
                            <dl className="mt-2 grid gap-1.5 font-mono text-[12.5px]">
                              {[
                                [clue.inspection.field1Label, clue.inspection.field1Value],
                                [clue.inspection.field2Label, clue.inspection.field2Value],
                                [clue.inspection.field3Label, clue.inspection.field3Value],
                              ]
                                .filter(([l, v]) => l && v)
                                .map(([l, v]) => (
                                  <div key={l} className="grid sm:grid-cols-[160px_1fr] gap-x-3">
                                    <dt className="text-ink-soft">{l}</dt>
                                    <dd className="text-ink break-words">{v}</dd>
                                  </div>
                                ))}
                            </dl>
                            <p className="mt-3 text-[14.5px] leading-[1.6]">
                              <span className="marker">{clue.inspection.observation}</span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* resultado */}
          <AnimatePresence>
            {answered && (
              <motion.div
                ref={resultRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-7 scroll-mb-28"
              >
                <div className={`rounded-md p-5 border-2 ${wasCorrect ? 'border-safe bg-safe/10' : 'border-scam bg-scam/10'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={`font-display font-extrabold text-[24px] leading-tight ${wasCorrect ? 'text-safe' : 'text-scam'}`}>
                      {wasCorrect ? 'Mandou bem, detetive!' : current.isScam ? 'Era golpe. Você caiu.' : 'Era seguro. Alarme falso.'}
                    </h3>
                    {wasCorrect && <span className="font-mono font-semibold text-[15px] text-safe shrink-0">+{lastEarned} XP</span>}
                  </div>
                  <p className="mt-2 text-[15px] leading-[1.6]">{current.explanation}</p>

                  {current.redFlags.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {current.redFlags.map((f) => (
                        <li key={f} className="flex gap-2 text-[14.5px]">
                          <X className="w-4 h-4 text-scam mt-0.5 shrink-0" strokeWidth={3} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!current.isScam && (
                    <div className="mt-3 flex gap-2 text-[14.5px]">
                      <Check className="w-4 h-4 text-safe mt-0.5 shrink-0" strokeWidth={3} />
                      Sem link estranho, sem pedido de dinheiro, sem pressa.
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-md bg-ink text-paper p-5">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-marker">Regra de ouro</div>
                  <p className="font-display font-semibold text-[19px] leading-snug mt-1">{current.pedagogy.goldenRule}</p>
                </div>

                <button
                  onClick={nextCase}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-md bg-marker text-ink font-display font-extrabold text-[18px] py-4 stamp-btn cursor-pointer"
                >
                  Próximo caso <ArrowRight className="w-5 h-5" />
                  <kbd className="hidden lg:inline font-mono text-[11px] font-normal opacity-60 ml-2">Enter</kbd>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* carimbos (desktop: dentro da ficha) */}
          {!answered && (
            <div className="hidden lg:grid grid-cols-2 gap-4 mt-8">
              <StampButton kind="scam" onClick={() => decide('scam')} hotkey="G" />
              <StampButton kind="safe" onClick={() => decide('safe')} hotkey="S" />
            </div>
          )}
        </motion.section>
      </div>

      {/* carimbos (celular: fixos na zona do polegar) */}
      {!answered && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-gradient-to-t from-desk via-desk/95 to-transparent">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <StampButton kind="scam" onClick={() => decide('scam')} />
            <StampButton kind="safe" onClick={() => decide('safe')} />
          </div>
        </div>
      )}
    </div>
  );
};

const StampButton = ({ kind, onClick, hotkey }: { kind: Verdict; onClick: () => void; hotkey?: string }) => (
  <button
    onClick={onClick}
    className={`stamp-btn cursor-pointer rounded-md py-4 lg:py-5 font-display font-extrabold text-[20px] lg:text-[24px] tracking-wide uppercase text-white flex items-center justify-center gap-2 ${
      kind === 'scam' ? 'bg-scam' : 'bg-safe'
    }`}
  >
    {kind === 'scam' ? 'É golpe' : 'É seguro'}
    {hotkey && <kbd className="font-mono text-[11px] font-normal opacity-70 border border-white/40 rounded px-1.5 py-0.5">{hotkey}</kbd>}
  </button>
);
