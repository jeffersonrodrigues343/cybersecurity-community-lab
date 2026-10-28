import { useEffect, useState } from 'react';
import { apiService, summarizeByAge, type AgeSummary, type GameResult } from '../services/api';

const AGE_LABEL: Record<AgeSummary['age_group'], string> = {
  young: '20–34 anos',
  adult: '35–49 anos',
  senior: '50–60 anos',
};

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

// Painel público de impacto: taxa de acerto por faixa etária e por tipo de mensagem
export const ResultsPanel = () => {
  const [rows, setRows] = useState<GameResult[] | null>(null);
  const [source, setSource] = useState<'online' | 'local'>('local');

  useEffect(() => {
    apiService.getResults().then(({ rows, source }) => {
      setRows(rows);
      setSource(source);
    });
  }, []);

  if (!rows) return <p className="p-6 text-white/70">Carregando resultados…</p>;

  const byAge = summarizeByAge(rows);
  const scams = rows.filter((r) => r.is_scam);
  const legit = rows.filter((r) => !r.is_scam);

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Resultados do simulador</h1>
          <p className="text-sm text-white/60">
            {rows.length} vereditos registrados de forma anônima
            {source === 'local' ? ' (somente deste navegador)' : ' (todos os jogadores)'}.
          </p>
        </header>

        <section aria-labelledby="g-age" className="space-y-3">
          <h2 id="g-age" className="font-semibold">Taxa de acerto por faixa etária</h2>
          {byAge.map((a) => (
            <div key={a.age_group} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{AGE_LABEL[a.age_group]}</span>
                <span className="tabular-nums">
                  {pct(a.correct, a.attempts)}% <span className="text-white/50">({a.attempts} tentativas)</span>
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden" role="img" aria-label={`${pct(a.correct, a.attempts)}% de acerto`}>
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct(a.correct, a.attempts)}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section aria-labelledby="t-age">
          <h2 id="t-age" className="font-semibold mb-2">Tabela detalhada</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/10">
                <th className="py-2">Faixa</th>
                <th className="py-2 text-right">Tentativas</th>
                <th className="py-2 text-right">Acertos</th>
                <th className="py-2 text-right">Pistas por caso</th>
              </tr>
            </thead>
            <tbody>
              {byAge.map((a) => (
                <tr key={a.age_group} className="border-b border-white/5">
                  <td className="py-2">{AGE_LABEL[a.age_group]}</td>
                  <td className="py-2 text-right tabular-nums">{a.attempts}</td>
                  <td className="py-2 text-right tabular-nums">{pct(a.correct, a.attempts)}%</td>
                  <td className="py-2 text-right tabular-nums">{a.avgClues.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="text-white/60">Golpes reconhecidos</div>
            <div className="text-2xl font-bold tabular-nums">{pct(scams.filter((r) => r.correct).length, scams.length)}%</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="text-white/60">Mensagens reais reconhecidas</div>
            <div className="text-2xl font-bold tabular-nums">{pct(legit.filter((r) => r.correct).length, legit.length)}%</div>
          </div>
        </section>

        <a href="/" className="inline-block text-sm text-emerald-300 underline">Voltar ao simulador</a>
      </div>
    </main>
  );
};
