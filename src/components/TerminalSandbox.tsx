import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Play, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface TerminalSandboxProps {
  onDiscoverSecretFlag?: () => void;
}

interface CommandLog {
  id: string;
  command: string;
  output: string;
  isError?: boolean;
}

export const TerminalSandbox = ({ onDiscoverSecretFlag }: TerminalSandboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandLog[]>([
    {
      id: 'init-1',
      command: 'systeminfo',
      output: 'HackLearn AttackBox v2.4 (Kali Linux Simulation Kernel 6.1)\nAmbiente Educacional de Extensão Universitária - CST ADS\nDigite "help" para ver os comandos de rede e segurança disponíveis.',
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    sound.playKeypress();
    const parts = cmd.toLowerCase().split(' ');
    const mainCmd = parts[0];
    let output = '';
    let isError = false;

    switch (mainCmd) {
      case 'help':
        output = `Comandos Disponíveis:\n  help        - Mostra esta lista de auxílio\n  ls          - Lista arquivos do diretório atual\n  cat <file>  - Lê o conteúdo de um arquivo (ex: cat flag.txt)\n  nmap <ip>   - Simula varredura de portas em um servidor de teste (ex: nmap 10.10.42.15)\n  whoami      - Exibe sua identidade no sistema\n  ods         - Exibe os Objetivos de Desenvolvimento Sustentável deste projeto\n  clear       - Limpa a tela do terminal`;
        break;

      case 'ls':
        output = `drwxr-xr-x 2 student student 4096 Sep 27 12:00 .\n-rw-r--r-- 1 student student  142 Sep 27 12:00 readme.txt\n-rw-r--r-- 1 student student   48 Sep 27 12:00 flag.txt\n-rwxr-xr-x 1 student student  890 Sep 27 12:00 port_scanner.py`;
        break;

      case 'cat':
        if (parts[1] === 'flag.txt') {
          output = `[+] FLAG ENCONTRADA NO TERMINAL:\nHACKLEARN{seguranca_web_iniciante_2024}\n\nCopie esta flag e valide-a na Missão 3 da página!`;
          sound.playSuccess();
          onDiscoverSecretFlag?.();
        } else if (parts[1] === 'readme.txt') {
          output = `Bem-vindo ao HackLearn! Esta ferramenta extensionista capacita cidadãos a entenderem o funcionamento de sistemas operacionais e segurança de redes.`;
        } else {
          output = `cat: ${parts[1] || ''}: Arquivo não encontrado. Tente "ls" para ver os arquivos disponíveis.`;
          isError = true;
          sound.playError();
        }
        break;

      case 'nmap':
        output = `Iniciando Nmap 7.94 scan em ${parts[1] || '10.10.42.15'}...\nPORT     STATE SERVICE  VERSION\n22/tcp   open  ssh      OpenSSH 8.9p1 (Ubuntu)\n80/tcp   open  http     Apache httpd 2.4.52\n443/tcp  open  ssl/http Apache httpd 2.4.52\n3306/tcp open  mysql    MySQL 8.0.35\n\nNmap concluído: 1 endereço IP (1 host up) escaneado em 1.42 segundos.`;
        sound.playSuccess();
        break;

      case 'whoami':
        output = `student@hacklearn-ads [Permissões: Discente Pesquisador / Extensão Universitária]`;
        break;

      case 'ods':
        output = `[ODS 4 - Educação de Qualidade]: Meta 4.4 - Desenvolver habilidades técnicas para o trabalho decente.\n[ODS 9 - Indústria, Inovação e Infraestrutura]: Democratização do acesso seguro à internet.`;
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        output = `bash: comando não reconhecido: "${cmd}". Digite "help" para ver os comandos válidos.`;
        isError = true;
        sound.playError();
    }

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        command: cmd,
        output,
        isError,
      },
    ]);
    setInputVal('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-mono">
      {/* Floating Toggle Pill */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            sound.playBlip();
            setIsOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-slate-900 border border-emerald-500/60 text-emerald-400 text-xs font-bold shadow-2xl shadow-emerald-950/60 hover:bg-slate-800 transition"
        >
          <TerminalIcon className="w-4 h-4 animate-pulse" />
          <span>Abrir Terminal Kali (Simulador)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </motion.button>
      )}

      {/* Terminal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`bg-[#0a0f18] border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isExpanded 
                ? 'w-[95vw] sm:w-[85vw] h-[80vh] fixed top-10 left-1/2 -translate-x-1/2 z-50' 
                : 'w-[90vw] sm:w-[480px] h-[360px]'
            }`}
          >
            {/* Window Bar */}
            <div className="bg-[#0f172a] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block cursor-pointer" onClick={() => setIsOpen(false)}></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span className="text-xs text-slate-300 font-bold ml-2 flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>student@hacklearn-kali: ~</span>
                </span>
              </div>

              <div className="flex items-center space-x-2 text-slate-400">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:text-white transition"
                  title={isExpanded ? 'Restaurar tamanho' : 'Expandir'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    sound.playBlip();
                    setIsOpen(false);
                  }}
                  className="p-1 hover:text-white transition"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
              <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-900 flex items-center justify-between">
                <span>TryHackMe Inspired AttackBox Terminal</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Conectado
                </span>
              </div>

              {history.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <span className="text-emerald-400 font-bold">student@hacklearn:~$</span>
                    <span className="text-white">{item.command}</span>
                  </div>
                  <pre
                    className={`whitespace-pre-wrap font-mono pl-2 text-[11px] ${
                      item.isError ? 'text-red-400' : 'text-slate-300'
                    }`}
                  >
                    {item.output}
                  </pre>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            {/* Prompt Input */}
            <form onSubmit={handleCommand} className="border-t border-slate-800 bg-[#080c14] p-2.5 flex items-center space-x-2">
              <span className="text-emerald-400 font-bold text-xs pl-2">student@hacklearn:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="digite um comando (ex: help, ls, nmap)..."
                className="flex-1 bg-transparent text-white text-xs font-mono focus:outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 p-1.5 rounded transition"
                title="Executar"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
