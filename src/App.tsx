import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Settings, 
  Users, 
  HelpCircle, 
  Sparkles, 
  MapPin, 
  Tv2, 
  ShieldCheck, 
  Lock, 
  BookOpen, 
  RefreshCw 
} from 'lucide-react';
import StudentAdventure from './components/StudentAdventure';
import TeacherPanel from './components/TeacherPanel';
import { Question } from './types';

export default function App() {
  const [currentRole, setCurrentRole] = useState<'student' | 'teacher'>('student');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameTimeLimit, setGameTimeLimit] = useState<number>(30); // Default to 30 minutes, 0 means unlimited
  const [loading, setLoading] = useState(true);
  const [teacherPass, setTeacherPass] = useState('');
  const [teacherAuthenticated, setTeacherAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [savedKeyExists, setSavedKeyExists] = useState(false);

  // Read stored key and model on mount
  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key') || '';
    const model = localStorage.getItem('gemini_api_model') || 'gemini-3-flash-preview';
    setApiKey(key);
    setSelectedModel(model);
    setSavedKeyExists(!!key);
    if (!key) {
      setIsSettingsOpen(true);
    }
  }, []);

  // Settle question template downloads on mount
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
      if (typeof data.isGameActive === 'boolean') {
        setIsGameActive(data.isGameActive);
      }
      if (typeof data.gameTimeLimit === 'number') {
        setGameTimeLimit(data.gameTimeLimit);
      }
    } catch (err) {
      console.error("Error loaded questions from custom Express bank fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleUpdateQuestionsInBank = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    setIsGameActive(true); // Any new custom questions uploaded / compiled from file instantly activates the game!
    // Sync updated questions to server backend for full persistence and alignment
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: newQuestions })
    }).catch(console.error);
    syncGameStatusToBackend(true);
  };

  const syncGameStatusToBackend = async (newActive: boolean) => {
    try {
      const response = await fetch('/api/game-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive })
      });
      const data = await response.json();
      if (data.success) {
        setIsGameActive(newActive);
      }
    } catch (err) {
      console.error("Error syncing game status:", err);
    }
  };

  const syncGameTimeLimitToBackend = async (newLimit: number) => {
    try {
      const response = await fetch('/api/game-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeLimit: newLimit })
      });
      const data = await response.json();
      if (data.success) {
        setGameTimeLimit(newLimit);
      }
    } catch (err) {
      console.error("Error syncing game time limit:", err);
    }
  };

  const handleTeacherLogIn = (e: React.FormEvent) => {
    e.preventDefault();
    const customStoredPass = localStorage.getItem('teacher_password');
    const entered = teacherPass.trim();
    
    let isCorrect = false;
    if (customStoredPass) {
      isCorrect = (entered === customStoredPass);
    } else {
      isCorrect = (entered.toUpperCase() === 'DUNGMATH' || entered === '123456');
    }

    if (isCorrect) {
      setTeacherAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mật khẩu quản trị chưa chính xác! Vui lòng liên hệ Thầy Phạm Văn Dũng.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-12 transition">
      
      {/* Decorative top ambient flow */}
      <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo / Title Brand area */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 text-slate-950 flex items-center justify-center rounded-xl shadow-inner font-black text-xl animate-spin-slow">
              ⭐
            </div>
            <div className="text-left">
              <h1 className="text-lg md:text-xl font-display font-black tracking-tight flex items-center gap-1.5 uppercase">
                Truy Tìm Kho Báu Toán Học
                <span className="bg-yellow-400 text-slate-950 text-[10px] font-bold py-0.5 px-2 rounded-full normal-case tracking-normal">2D Game</span>
              </h1>
              <p className="text-[10px] text-emerald-100 font-medium">Hệ Thống Phối Hợp Giáo Dục Trực Tuyến & Master AI Agent</p>
            </div>
          </div>

          {/* Quick Role switches & Settings button */}
          <div className="flex items-center gap-3 shrink-0 select-none flex-wrap justify-end">
            <div className="flex bg-black/25 relative p-1 rounded-xl border border-white/10 shrink-0 select-none">
              <button
                onClick={() => setCurrentRole('student')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'student'
                    ? 'bg-white text-slate-950 shadow font-extrabold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>🎮 Học Sinh Chơi</span>
              </button>
              <button
                onClick={() => setCurrentRole('teacher')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'teacher'
                    ? 'bg-white text-slate-955 shadow font-extrabold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>🏫 Giáo Viên Quản Trị</span>
              </button>
            </div>

            {/* Settings button & red helper text */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-md"
              >
                <Settings className="w-4 h-4" />
                <span>Cấu hình AI</span>
              </button>
              <a 
                href="https://aistudio.google.com/api-keys" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-red-300 font-bold hover:underline animate-pulse shrink-0"
              >
                Lấy API key để sử dụng app
              </a>
            </div>
          </div>

        </div>
      </div>

      {loading ? (
        /* Global Fallback Loader spinner */
        <div className="flex flex-col items-center justify-center py-32 gap-3 max-w-sm mx-auto">
          <RefreshCw className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-xs text-slate-500 font-mono italic">Đang tải cấu phông ngân hàng 22 trạm toán học từ máy chủ...</p>
        </div>
      ) : (
        /* Dynamic Screen Router */
        <main className="transition duration-150">
          {currentRole === 'student' ? (
            /* Student play screen area */
            <StudentAdventure 
              questions={questions}
              isGameActive={isGameActive}
              gameTimeLimit={gameTimeLimit}
              onGameFinished={(score, state) => {
                console.log("Game finished callback received:", score, state);
              }}
              onRefreshGameStatus={loadQuestions}
            />
          ) : (
            /* Teacher dashboard guard screen or authenticated board */
            <div className="max-w-6xl mx-auto px-4 mt-6">
              {!teacherAuthenticated ? (
                /* Authenticated lock gateway */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border p-8 max-w-md mx-auto shadow-lg text-center mt-12 space-y-6"
                >
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-950">Xác Minh Danh Tính Giáo Viên</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Vui lòng nhập mật khẩu quản lý học liệu của <b>Thầy Phạm Văn Dũng</b> để tiếp tục.
                    </p>
                  </div>

                  <form onSubmit={handleTeacherLogIn} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mật khẩu giáo viên</label>
                      <input
                        type="password"
                        placeholder="Nhập DUNGMATH hoặc mật khẩu mới của Thầy"
                        value={teacherPass}
                        onChange={(e) => setTeacherPass(e.target.value)}
                        className="w-full border rounded-xl py-2.5 px-4 text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                        autoFocus
                      />
                    </div>

                    {authError && (
                      <p className="text-red-600 text-xs font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100">
                        {authError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      Bảo mộc đăng nhập
                    </button>
                  </form>

                  <div className="pt-4 border-t border-slate-100 text-[10px] text-rose-500 font-bold bg-rose-50 p-2.5 rounded-lg">
                    🔒 Khu vực hạn chế: Chỉ dành riêng cho Giáo viên Phạm Văn Dũng quản trị chuyên môn. Học sinh không được phép truy cập vào mục này.
                  </div>
                </motion.div>
              ) : (
                /* Authenticated Teacher Panel board content */
                <TeacherPanel 
                  questions={questions}
                  isGameActive={isGameActive}
                  gameTimeLimit={gameTimeLimit}
                  onUpdateQuestions={handleUpdateQuestionsInBank}
                  onChangeGameActive={syncGameStatusToBackend}
                  onChangeGameTimeLimit={syncGameTimeLimitToBackend}
                />
              )}
            </div>
          )}
        </main>
      )}

      {/* Shared human footer */}
      <footer className="mt-16 text-center text-[11px] text-slate-400 space-y-1 font-medium select-none">
        <p>© 2026 Bản quyền phân hiệu thuộc về Giáo viên Toán học: <b>Phạm Văn Dũng</b></p>
        <p className="text-slate-300">Vận hành đồng bộ bởi AI Game Master Central Gateway • Server Fullstack Ready</p>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 max-w-lg w-full shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto animate-duration-150"
            >
              {/* Close Button: only show if a key exists in local storage */}
              {savedKeyExists && (
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 uppercase tracking-tight">Cấu hình Trí Tuệ Nhân Tạo AI</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thiết lập API key và mô hình AI để vận hành các tính năng bóc đề thi OCR và tạo gợi ý học tập tự động.
                </p>
              </div>

              {/* Form Content */}
              <div className="space-y-5">
                {/* API Key input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập khóa API Gemini (AIzaSy...)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-slate-950 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold shadow-xs"
                  />
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                      Để lấy mã API Key, vui lòng truy cập và tạo khóa miễn phí tại{' '}
                      <a
                        href="https://aistudio.google.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-600 font-bold hover:underline"
                      >
                        Google AI Studio API Keys
                      </a>.
                    </p>
                  </div>
                </div>

                {/* Model Selection cards */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">
                    Chọn Model AI Mặc Định
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Model 1: gemini-3-flash-preview */}
                    <div
                      onClick={() => setSelectedModel('gemini-3-flash-preview')}
                      className={`p-3.5 border-2 rounded-2xl cursor-pointer transition flex items-center gap-3.5 ${
                        selectedModel === 'gemini-3-flash-preview'
                          ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        selectedModel === 'gemini-3-flash-preview' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {selectedModel === 'gemini-3-flash-preview' && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Gemini 3.5 Flash Preview</span>
                          <span className="bg-emerald-600 text-white text-[9px] font-semibold py-0.5 px-1.5 rounded-full">Default</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Tốc độ cực nhanh, phản hồi tức thì, tối ưu hóa game thám hiểm.</p>
                      </div>
                    </div>

                    {/* Model 2: gemini-3-pro-preview */}
                    <div
                      onClick={() => setSelectedModel('gemini-3-pro-preview')}
                      className={`p-3.5 border-2 rounded-2xl cursor-pointer transition flex items-center gap-3.5 ${
                        selectedModel === 'gemini-3-pro-preview'
                          ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        selectedModel === 'gemini-3-pro-preview' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {selectedModel === 'gemini-3-pro-preview' && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900">Gemini 3.5 Pro Preview</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Độ thông minh vượt trội, dịch thuật và bóc tách đề cực tốt.</p>
                      </div>
                    </div>

                    {/* Model 3: gemini-2.5-flash */}
                    <div
                      onClick={() => setSelectedModel('gemini-2.5-flash')}
                      className={`p-3.5 border-2 rounded-2xl cursor-pointer transition flex items-center gap-3.5 ${
                        selectedModel === 'gemini-2.5-flash'
                          ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        selectedModel === 'gemini-2.5-flash' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {selectedModel === 'gemini-2.5-flash' && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900">Gemini 2.5 Flash</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Mô hình ổn định truyền thống, thời gian đáp ứng tốt.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={() => {
                    const trimmedKey = apiKey.trim();
                    if (!trimmedKey) {
                      alert('Vui lòng nhập API Key để kích hoạt các tính năng AI của app.');
                      return;
                    }
                    localStorage.setItem('gemini_api_key', trimmedKey);
                    localStorage.setItem('gemini_api_model', selectedModel);
                    setSavedKeyExists(true);
                    setIsSettingsOpen(false);
                    // Force refresh to reload questions if needed
                    loadQuestions();
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  Lưu cấu hình AI
                </button>

                {!savedKeyExists && (
                  <p className="text-red-600 text-[10px] font-bold text-center animate-pulse">
                    ⚠️ Bạn phải nhập API key trước khi tiếp tục thám hiểm!
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
