import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Settings2, 
  UploadCloud, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Plus, 
  Calendar, 
  Flame, 
  CheckCircle, 
  FileText, 
  UserCheck, 
  ArrowRight,
  BookOpen,
  Send,
  AlertTriangle,
  Clock,
  Info,
  Download,
  Check,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Question, StudentLog, TeacherAnalytics, SubStatement } from '../types';
import { MathAndImageRenderer } from './MathAndImageRenderer';

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
}

function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5 border border-slate-100 bg-slate-50/75 p-2 rounded-lg text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-500 block uppercase text-[9px]">{label}</span>
        {value && (
          <button 
            type="button"
            onClick={() => onChange('')}
            className="text-red-500 hover:text-red-600 font-bold text-[9px] uppercase cursor-pointer"
          >
            🗑️ Xóa ảnh
          </button>
        )}
      </div>
      
      {value ? (
        <div className="relative border rounded-lg overflow-hidden bg-white max-h-24 flex items-center justify-center p-1 font-sans">
          <img src={value} alt="Preview" className="max-h-20 object-contain" />
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 border border-dashed border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 text-slate-500 hover:text-emerald-700 transition rounded-lg text-[10px] font-bold text-center cursor-pointer flex items-center justify-center gap-1"
          >
            🖼️ Tải Ảnh Lên (Công thức/Đồ thị)
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (typeof reader.result === 'string') {
                    onChange(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

const SAMPLE_DOC_TEXT = `--- CẤU TRÚC ĐỀ MẪU CHUẨN ĐỂ NHẬP FILE THÀNH CÔNG ---
TRÒ CHƠI HOẠT ĐỘNG VỚI 22 TRẠM THI TOÁN HỌC KHÉP KÍN:
Trạm 1 - 12: Trắc nghiệm 4 lựa chọn (Phần khu Rừng rậm)
Trạm 13 - 16: Đúng hoặc Sai gồm 4 mệnh đề phụ (Phần khu Hang động)
Trạm 17 - 22: Điền đáp số ngắn (Phần khu Thung lũng sương mù)

---------------------------------------------------------
VÍ DỤ ĐỊNH DẠNG CHI TIẾT TỪNG PHÂN KHU ĐỂ SOẠN GIÁO ÁN:
---------------------------------------------------------

=== TRẠM 1 ĐẾN 12: TRẮC NGHIỆM 4 ĐÁP ÁN ===
Trạm 1
Landscape: Rừng rậm
Câu hỏi: Một hình lăng trụ đứng tam giác có diện tích đáy bằng $12\\text{ cm}^2$ và chiều cao lăng trụ bằng $5\\text{ cm}$. Tính thể tích của hình lăng trụ đó.
A. $30\\text{ cm}^3$
B. $60\\text{ cm}^3$
C. $24\\text{ cm}^3$
D. $15\\text{ cm}^3$
Correct: B
Explanation: Thể tích hình lăng trụ thực hiện theo công thức: $V = B \\cdot h$. Biết $B = 12\\text{ cm}^2$ và $h = 5\\text{ cm}$, suy ra $V = 12 \\cdot 5 = 60\\text{ cm}^3$.

=== TRẠM 13 ĐẾN 16: ĐÚNG / SAI 4 MỆNH ĐỀ ===
Trạm 13
Landscape: Hang động
Câu hỏi: Cho đa thức $P(x) = x^2 - 6x + 9$. Xét tính Đúng hay Sai của các phát biểu sau đây:
a) Đa thức $P(x)$ có thể viết dưới dạng bình phương của một hiệu là $(x-3)^2$. -> Đúng
b) Giá trị của $P(x)$ bằng $0$ khi $x = -3$. -> Sai
c) Với mọi giá trị số thực $x$, ta luôn có $P(x) \\ge 0$. -> Đúng
d) Đồ thị hàm số tương ứng cắt trục hoành tại hai điểm phân biệt. -> Sai
Explanation: Ta có $P(x) = (x-3)^2$. Khi $x = 3$ thì $P(3) = 0$ (cho nên phát biểu b sai). Với mọi $x$ thực, ta có $P(x) = (x-3)^2 \\ge 0$ nên phát biểu c đúng. Phương trình $(x-3)^2 = 0$ có nghiệm kép duy nhất $x=3$ nên đồ thị chỉ tiếp xúc trục hoành tại 1 điểm duy nhất (cho nên phát biểu d sai).

=== TRẠM 17 ĐẾN 22: TRẢ LỜI ĐIỀN ĐÁP SỐ NGẮN ===
Trạm 17
Landscape: Thung lũng sương mù
Câu hỏi: Cho phương trình bậc hai sau: $x^2 - 25 = 0$. Tìm nghiệm dương duy nhất của phương trình này.
Correct: 5
Keywords: 5, x=5, x = 5
Explanation: Ta có $x^2 = 25$ dẫn đến hai nghiệm là $x = 5$ hoặc $x = -5$. Đề bài yêu cầu tìm nghiệm thực dương duy nhất, do đó đáp số chính xác là 5.
`;

const SAMPLE_CHALLENGE1_TEXT = `=== THỬ THÁCH 1: BIỂU MẪU CÂU HỎI TRẮC NGHIỆM A, B, C, D (TRẠM 1 - 12) ===
- Định dạng: Trắc nghiệm khách quan gồm 4 đáp án A, B, C, D.
- Quy tắc gạch chân: Đáp án đúng sẽ được gạch chân kí tự chữ cái lựa chọn (Ví dụ: <u>A</u> hoặc <u>B</u> hoặc <u>C</u> hoặc <u>D</u>).
- Lời giải bài toán: Quý Thầy không cần nhập lời giải mẫu. Trình Game Master AI sẽ tự động lập luận và ghi nhận lời giải toán học chi tiết.

Trạm 1
Landscape: Rừng rậm
Câu hỏi: Một hình lăng trụ đứng tam giác có diện tích đáy bằng $12\\text{ cm}^2$ và chiều cao lăng trụ bằng $5\\text{ cm}$. Tính thể tích của hình lăng trụ đó.
A. $30\\text{ cm}^3$
<u>B</u>. $60\\text{ cm}^3$
C. $24\\text{ cm}^3$
D. $15\\text{ cm}^3$

Trạm 2
Landscape: Rừng rậm
Câu hỏi: Tìm số tự nhiên $x$ thỏa mãn phương trình: $3x - 5 = 10$.
<u>A</u>. 5
B. 15
C. 4
D. 3
`;

const SAMPLE_CHALLENGE2_TEXT = `=== THỬ THÁCH 2: BIỂU MẪU CÂU HỎI ĐÚNG / SAI (TRẠM 13 - 16) ===
- Định dạng: Mỗi câu hỏi lớn gồm đúng 4 mệnh đề phụ và xét tính Đúng/Sai.
- Quy tắc gạch chân: Ý phụ nào ĐÚNG sẽ được gạch chân kí tự chỉ mục (Ví dụ: <u>a)</u> hoặc <u>b)</u> hoặc <u>c)</u> hoặc <u>d)</u>). Ý phụ nào KHÔNG được gạch chân sẽ đại diện cho phán đoán là SAI.
- Lời giải bài toán: Quý Thầy không cần nhập lời giải, Game Master AI tự động lập luận từng ý phụ.

Trạm 13
Landscape: Hang động
Câu hỏi: Cho đa thức $P(x) = x^2 - 6x + 9$. Xét tính Đúng hay Sai của các phát biểu sau đây:
<u>a)</u> Đa thức $P(x)$ có thể viết dưới dạng bình phương của một hiệu là $(x-3)^2$.
b) Giá trị của $P(x)$ bằng $0$ khi $x = -3$.
<u>c)</u> Với mọi giá trị số thực $x$, ta luôn có $P(x) \\ge 0$.
d) Đồ thị hàm số tương ứng cắt trục hoành tại hai điểm phân biệt.
`;

const SAMPLE_CHALLENGE3_TEXT = `=== THỬ THÁCH 3: BIỂU MẪU CÂU HỎI TRẢ LỜI NGẮN (TRẠM 17 - 22) ===
- Định dạng: Câu hỏi tự luận điền đáp số ngắn. Học sinh bắt buộc nhập kết quả đáp án dạng số.
- Quy tắc đáp án: Ghi trực tiếp nhãn "Đáp án: " kèm số kết quả ngay phía dưới câu hỏi bài toán.
- Quy tắc số thập phân: Bạn bắt buộc phải ghi bằng dấu phẩy "," ngăn cách chứ không dùng dấu chấm (Ví dụ đúng của 2.5 phải ghi là "Đáp án: 2,5").
- Lời giải bài toán: Game Master AI tự động lập biểu thức và tìm giải thuật thuyết minh rõ ràng từng bước.

Trạm 17
Landscape: Thung lũng sương mù
Câu hỏi: Cho phương trình bậc hai sau: $x^2 - 25 = 0$. Tìm nghiệm dương duy nhất của phương trình này.
Đáp án: 5

Trạm 18
Landscape: Thung lũng sương mù
Câu hỏi: Tính diện tích của một hình tam giác có độ dài đáy là $5\\text{ cm}$ và chiều cao tương ứng là $1,5\\text{ cm}$.
Đáp án: 3,75
`;

interface TeacherPanelProps {
  questions: Question[];
  isGameActive: boolean;
  gameTimeLimit?: number;
  onUpdateQuestions: (newQuestions: Question[]) => void;
  onChangeGameActive?: (active: boolean) => void;
  onChangeGameTimeLimit?: (limit: number) => void;
}

export default function TeacherPanel({ 
  questions, 
  isGameActive, 
  gameTimeLimit = 30,
  onUpdateQuestions, 
  onChangeGameActive,
  onChangeGameTimeLimit 
  const [activeTab, setActiveTab] = useState<'analytics' | 'questions-bank' | 'gemini-tools' | 'password-settings'>('analytics');
  
  const getKeysHeader = () => {
    const storedKeys = localStorage.getItem('gemini_api_keys') || localStorage.getItem('gemini_api_key') || '';
    if (storedKeys.startsWith('[')) {
      try {
        const parsed = JSON.parse(storedKeys);
        if (Array.isArray(parsed)) {
          return parsed.join(',');
        }
      } catch (e) {}
    }
    return storedKeys;
  };
  
  // Password change states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  
  // Game states we track
  const [studentLogs, setStudentLogs] = useState<StudentLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);

  // Gemini generator options
  const [themeInput, setThemeInput] = useState('Trọng tâm kiến thức Toán ôn thi cuối kỳ II');
  const [gradeInput, setGradeInput] = useState('Lớp 6');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Challenge-specific files state
  const [fileToUpload1, setFileToUpload1] = useState<File | null>(null);
  const [fileToUpload2, setFileToUpload2] = useState<File | null>(null);
  const [fileToUpload3, setFileToUpload3] = useState<File | null>(null);

  const [uploadFileName1, setUploadFileName1] = useState('');
  const [uploadFileName2, setUploadFileName2] = useState('');
  const [uploadFileName3, setUploadFileName3] = useState('');

  // Challenge-specific pasted text state
  const [pastedContent1, setPastedContent1] = useState('');
  const [pastedContent2, setPastedContent2] = useState('');
  const [pastedContent3, setPastedContent3] = useState('');

  const [processingOcr, setProcessingOcr] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [showSampleTemplate, setShowSampleTemplate] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  
  // Storing copy indicators
  const [copiedChallengeText, setCopiedChallengeText] = useState<string | null>(null);

  const handleDownloadSampleFileOfChallenge = (challengeId: 'challenge1' | 'challenge2' | 'challenge3' | 'all') => {
    let text = SAMPLE_DOC_TEXT;
    let filename = 'mau_de_bai_toan_hoc_22_tram.txt';
    if (challengeId === 'challenge1') {
      text = SAMPLE_CHALLENGE1_TEXT;
      filename = 'mau_de_trac_nghiem_thu_thach_1.txt';
    } else if (challengeId === 'challenge2') {
      text = SAMPLE_CHALLENGE2_TEXT;
      filename = 'mau_de_dung_sai_thu_thach_2.txt';
    } else if (challengeId === 'challenge3') {
      text = SAMPLE_CHALLENGE3_TEXT;
      filename = 'mau_de_tra_loi_ngan_thu_thach_3.txt';
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySampleChallenge = (challengeId: 'challenge1' | 'challenge2' | 'challenge3' | 'all') => {
    let text = SAMPLE_DOC_TEXT;
    if (challengeId === 'challenge1') text = SAMPLE_CHALLENGE1_TEXT;
    else if (challengeId === 'challenge2') text = SAMPLE_CHALLENGE2_TEXT;
    else if (challengeId === 'challenge3') text = SAMPLE_CHALLENGE3_TEXT;

    navigator.clipboard.writeText(text);
    setCopiedChallengeText(challengeId);
    setTimeout(() => setCopiedChallengeText(null), 2000);
  };

  // Modern handle file upload and parse
  const handleFileUploadAndImport = async (challengeType: 'challenge1' | 'challenge2' | 'challenge3' | 'all', targetFile: File | null) => {
    if (!targetFile) {
      setFeedbackMessage({ type: 'error', text: 'Vui lòng chọn một file đính kèm trước khi tải lên.' });
      return;
    }

    setFileProcessing(true);
    setFeedbackMessage(null);

    const convertBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          const result = fileReader.result as string;
          resolve(result.split(',')[1]);
        };
        fileReader.onerror = (error) => {
          reject(error);
        };
      });
    };

    try {
      const key = getKeysHeader();
      const model = localStorage.getItem('gemini_api_model') || 'gemini-3-flash-preview';
      const base64Data = await convertBase64(targetFile);
      const response = await fetch('/api/gemini/ocr-file', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': key,
          'x-api-model': model
        },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileName: targetFile.name,
          mimeType: targetFile.type,
          challengeType
        })
      });

      const data = await response.json();
      if (data.success && data.questions) {
        onUpdateQuestions(data.questions);
        let challengeNameText = 'mảng 22 trạm thám hiểm sinh cảnh';
        if (challengeType === 'challenge1') {
          challengeNameText = 'Thử thách 1 (Trắc nghiệm Trạm 1-12)';
          setFileToUpload1(null);
          setUploadFileName1('');
        } else if (challengeType === 'challenge2') {
          challengeNameText = 'Thử thách 2 (Đúng / Sai Trạm 13-16)';
          setFileToUpload2(null);
          setUploadFileName2('');
        } else if (challengeType === 'challenge3') {
          challengeNameText = 'Thử thách 3 (Trả lời ngắn Trạm 17-22)';
          setFileToUpload3(null);
          setUploadFileName3('');
        }
        setFeedbackMessage({ 
          type: 'success', 
          text: `Tuyệt vời! Đã trích xuất thành công tài liệu và cập nhật bổ sung ${challengeNameText} từ file "${targetFile.name}"!` 
        });
      } else {
        throw new Error(data.error || 'Không bóc tách được câu hỏi từ file.');
      }
    } catch (err: any) {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.message || 'Lỗi bóc tách tệp tải lên qua AI. Vui lòng kiểm tra lại file của thầy cô (.docx, .pdf hoặc ảnh).' 
      });
    } finally {
      setFileProcessing(false);
    }
  };

  // Manual Editor states
  const [editingStation, setEditingStation] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    questionText: string;
    questionImage?: string;
    correctAnswer: string;
    options: string[];
    optionsImages: string[];
    explanation: string;
    explanationImage?: string;
    keywords: string;
    subStatements: SubStatement[];
  }>({
    questionText: '',
    questionImage: '',
    correctAnswer: '',
    options: [],
    optionsImages: [],
    explanation: '',
    explanationImage: '',
    keywords: '',
    subStatements: []
  });

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch initial analytics student logs
  const fetchStudentLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch('/api/teacher/logs');
      const data = await response.json();
      setStudentLogs(data.logs || []);
    } catch (err) {
      console.error("Error fetching logs dashboard:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchStudentLogs();
  }, []);

  // Compute stats metrics
  const totalStudents = studentLogs.filter(s => s.completed).length;

  const calculateAverageTime = () => {
    const completed = studentLogs.filter(s => s.completed);
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, curr) => acc + curr.timeTakenMinutes, 0);
    return Number((sum / completed.length).toFixed(1));
  };

  const calculateHardestStation = () => {
    // Collect all failures across logs
    const failCounter: Record<number, number> = {};
    studentLogs.forEach(log => {
      if (log.wrongCountAtStation) {
        Object.entries(log.wrongCountAtStation).forEach(([st, count]) => {
          const stNum = Number(st);
          failCounter[stNum] = (failCounter[stNum] || 0) + (count as number);
        });
      }
    });

    let hardest = 13; // default
    let maxFails = 0;
    Object.entries(failCounter).forEach(([st, fails]) => {
      if (fails > maxFails) {
        maxFails = fails;
        hardest = Number(st);
      }
    });
    return hardest;
  };

  const getLeaderboard = () => {
    return [...studentLogs]
      .filter(s => s.completed)
      .sort((a, b) => b.score - a.score || a.timeTakenMinutes - b.timeTakenMinutes)
      .slice(0, 5);
  };

  // Generate Master AI Suggestion / Custom consultation
  const handleGenerateReportSuggestions = async () => {
    setLoadingReport(true);
    setReportMarkdown('');
    try {
      const key = getKeysHeader();
      const model = localStorage.getItem('gemini_api_model') || 'gemini-3-flash-preview';
      const response = await fetch('/api/gemini/generate-report-suggestions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': key,
          'x-api-model': model
        }
      });
      const data = await response.json();
      setReportMarkdown(data.report || '');
    } catch (err) {
      setReportMarkdown("Đang chạy ở chế độ ngoại tuyến. Tuy nhiên, AI gợi ý giáo viên Phạm Văn Dũng nên tập trung ôn tập thêm phần đổi tỉ số bản đồ và thể tích hình khối đa diện lớp 6.");
    } finally {
      setLoadingReport(false);
    }
  };

  // Settle dynamic questions generator via Gemini model
  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    setFeedbackMessage(null);
    try {
      const key = getKeysHeader();
      const model = localStorage.getItem('gemini_api_model') || 'gemini-3-flash-preview';
      const response = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': key,
          'x-api-model': model
        },
        body: JSON.stringify({ theme: themeInput, grade: gradeInput })
      });
      const data = await response.json();
      if (data.success && data.questions) {
        onUpdateQuestions(data.questions);
        setFeedbackMessage({ type: 'success', text: `Đã cập nhật thành công 22 trạm thám hiểm mới cho ${gradeInput}! Chủ đề: "${themeInput}"` });
      } else {
        throw new Error(data.error || "Gặp lỗi tạo ngân hàng");
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || "Tạo câu hỏi thất bại. Hãy kiểm tra khóa GEMINI_API_KEY." });
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Run doc OCR paste parser
  const handleOcrImport = async (challengeType: 'challenge1' | 'challenge2' | 'challenge3' | 'all', targetText: string) => {
    if (!targetText.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Vui lòng dán/nhập nội dung văn bản đề bài trước khi xử lý OCR.' });
      return;
    }
    setProcessingOcr(true);
    setFeedbackMessage(null);
    try {
      const key = getKeysHeader();
      const model = localStorage.getItem('gemini_api_model') || 'gemini-3-flash-preview';
      const response = await fetch('/api/gemini/ocr-import', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': key,
          'x-api-model': model
        },
        body: JSON.stringify({ docContent: targetText, challengeType })
      });
      const data = await response.json();
      if (data.success && data.questions) {
        onUpdateQuestions(data.questions);
        let challengeNameText = '22 trạm thám hiểm sinh cảnh';
        if (challengeType === 'challenge1') {
          challengeNameText = 'Thử thách 1 (Trắc nghiệm Trạm 1-12)';
          setPastedContent1('');
        } else if (challengeType === 'challenge2') {
          challengeNameText = 'Thử thách 2 (Đúng / Sai Trạm 13-16)';
          setPastedContent2('');
        } else if (challengeType === 'challenge3') {
          challengeNameText = 'Thử thách 3 (Trả lời ngắn Trạm 17-22)';
          setPastedContent3('');
        }
        setFeedbackMessage({ 
          type: 'success', 
          text: `Đã bóc tách văn bản đề thi và cập nhật thành công cho ${challengeNameText}!` 
        });
      } else {
        throw new Error(data.error || 'Lỗi bóc tách OCR');
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Không thể xử lý OCR. Kiểm tra đầu vào và API Key.' });
    } finally {
      setProcessingOcr(false);
    }
  };

  // Settle reset to baseline
  const handleResetBaseline = async () => {
    if (!confirm("Bạn có chắc chắn muốn khôi phục lại ngân hàng câu hỏi gốc gồm 22 trạm toán học điển hình không? All thay đổi sẽ bị ghi đè.")) return;
    try {
      const response = await fetch('/api/questions/reset', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        onUpdateQuestions(data.questions);
        onChangeGameActive?.(false); // Set to inactive when reset!
        setFeedbackMessage({ type: 'success', text: 'Khôi phục ngân hàng câu hỏi gốc thành công và đã hoàn trả trạng thái trò chơi về chưa kích hoạt!' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Settle Question Editing State
  const startEditQuestion = (q: Question) => {
    setEditingStation(q.station);
    setEditForm({
      questionText: q.questionText,
      questionImage: q.questionImage || '',
      correctAnswer: q.correctAnswer,
      options: q.options || [],
      optionsImages: q.optionsImages || (q.options ? q.options.map(() => '') : []),
      explanation: q.explanation,
      explanationImage: q.explanationImage || '',
      keywords: q.keywords ? q.keywords.join(', ') : '',
      subStatements: q.subStatements ? JSON.parse(JSON.stringify(q.subStatements)) : []
    });
  };

  const handleSaveQuestionEdit = async () => {
    if (!editingStation) return;
    
    const updatedQuestions = questions.map(q => {
      if (q.station === editingStation) {
        return {
          ...q,
          questionText: editForm.questionText,
          questionImage: editForm.questionImage || undefined,
          correctAnswer: editForm.correctAnswer,
          options: editForm.options.length > 0 ? editForm.options : undefined,
          optionsImages: editForm.optionsImages.length > 0 ? editForm.optionsImages : undefined,
          explanation: editForm.explanation,
          explanationImage: editForm.explanationImage || undefined,
          keywords: editForm.keywords ? editForm.keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
          subStatements: editForm.subStatements.length > 0 ? editForm.subStatements : undefined
        };
      }
      return q;
    });

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: updatedQuestions })
      });
      const data = await response.json();
      if (data.success) {
        onUpdateQuestions(updatedQuestions);
        setEditingStation(null);
        setFeedbackMessage({ type: 'success', text: `Cập nhật thành công và đồng bộ Trạm ${editingStation} lên máy chủ!` });
      } else {
        throw new Error(data.error || 'Lỗi lưu dữ liệu');
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: `Không thể lưu thay đổi lên máy chủ: ${err.message}` });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 font-sans text-left">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-emerald-600" />
            Văn Phòng Bản Quyền & Quản Trị Hệ Thống
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Chào mừng Thầy <b>Phạm Văn Dũng</b>. Đây là nơi phân tích dữ liệu làm bài và thiết lập ngân hàng câu hỏi 22 trạm sinh cảnh của học sinh.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={fetchStudentLogs}
            className="p-2 border border-slate-200 hover:bg-slate-50 transition rounded-lg text-slate-600 flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
            Đồng bộ dữ liệu
          </button>
          <button
            onClick={handleResetBaseline}
            className="p-2 border border-red-200 hover:bg-red-50 text-red-600 transition rounded-lg text-xs font-semibold cursor-pointer"
            title="Khôi phục ngân hàng câu hỏi mốc và đặt trạng thái trò chơi về chưa kích hoạt"
          >
            Khôi phục gốc (22 Trạm)
          </button>
        </div>
      </div>

      {/* Game Creation & Activation Live Status bar */}
      <div className={`p-4 rounded-2xl mb-6 border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
        isGameActive 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
          : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
      }`}>
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isGameActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400 animate-pulse'}`}></span>
            <span className={`text-xs font-black uppercase tracking-wider ${isGameActive ? 'text-emerald-700' : 'text-indigo-700'}`}>
              Trực tuyến: {isGameActive ? '🟢 ĐÃ XUẤT BẢN ĐỀ THI & PHÁT HÀNH' : '⚪ ĐANG LÀ BẢN NHÁP (DS CHƯA XUẤT BẢN)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {isGameActive 
              ? 'Học sinh đang có thể trực tiếp làm bài thám hiểm 22 trạm trực tuyến. Mọi chỉnh sửa sẽ hiển thị ngay lập tức.' 
              : 'Trò chơi chưa được xuất bản. Học sinh sẽ chưa thể tìm thấy hoặc tham gia các trạm thám hiểm mới cho đến khi Thầy bấm nút "Xuất Bản".'}
          </p>
        </div>
        
        <div className="shrink-0 flex gap-2 w-full sm:w-auto">
          {isGameActive ? (
            <button
              onClick={() => {
                onChangeGameActive?.(false);
                setFeedbackMessage({ type: 'success', text: '⏸️ Đã tạm ngừng xuất bản. Học sinh tạm thời không thể làm đề thi.' });
              }}
              className="w-full sm:w-auto px-4 py-2 border-2 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition rounded-lg text-xs font-black cursor-pointer shadow-sm text-center"
            >
              ⏸️ Tạm hoãn trò chơi
            </button>
          ) : (
            <button
              onClick={() => {
                onChangeGameActive?.(true);
                setFeedbackMessage({ type: 'success', text: '🚀 Xuất bản đề thi thành công! Học sinh đã có thể tham gia thám hiểm trực tuyến.' });
              }}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white transition rounded-lg text-xs font-black cursor-pointer shadow-sm text-center animate-pulse"
            >
              🚀 Xuất Bản Đề Thi & Phát Hành
            </button>
          )}
        </div>
      </div>

      {/* Custom Game Duration Limit configuration panel */}
      <div className="p-4 bg-white border border-slate-200/95 rounded-2xl mb-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Cài đặt Thời gian thám hiểm của học sinh
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Thiết lập thời hạn làm bài đếm ngược tự động. Khi hết giờ trò chơi sẽ khóa và kết thúc. Nhập <b>0</b> để thi đấu <b>không giới hạn thời gian</b>.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            {[0, 15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onChangeGameTimeLimit?.(mins)}
                className={`py-1 px-2.5 rounded-md text-[10px] font-black cursor-pointer transition ${
                  gameTimeLimit === mins
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mins === 0 ? 'Vô hạn (∞)' : `${mins} phút`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Tự nhập số bất kì:</span>
            <input
              type="number"
              min="0"
              max="999"
              value={gameTimeLimit === 0 ? '' : gameTimeLimit}
              placeholder="0 (Vô hạn)"
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                if (!isNaN(val) && val >= 0) {
                  onChangeGameTimeLimit?.(val);
                }
              }}
              className="w-20 border border-slate-200 rounded-lg py-1 px-2 text-center font-black text-xs text-indigo-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
            <span className="text-[10px] font-bold text-slate-500 font-sans">phút</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6 gap-1 bg-slate-100 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          Dashboard Phân Tích
        </button>
        
        <button
          onClick={() => setActiveTab('questions-bank')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'questions-bank'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          Quản Lý 22 Trạm Đề
        </button>

        <button
          onClick={() => setActiveTab('gemini-tools')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'gemini-tools'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          Công Cụ Sinh Đề Gemini AI
        </button>

        <button
          onClick={() => setActiveTab('password-settings')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'password-settings'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings2 className="w-4 h-4 text-teal-600" />
          Đổi Mật Khẩu
        </button>
      </div>

      {/* Global alert feedback */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-xs font-medium mb-6 ${
              feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
            }`}
          >
            {feedbackMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB: Dashboard Reports */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Quick Metrics Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Đã Hoàn Thành Thám Hiểm</span>
              <strong className="text-4xl font-display font-black text-slate-900 block mt-1">{totalStudents} em</strong>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trên tổng số {studentLogs.length} kết nối</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Thời Gian Hoàn Thành Trung Bình</span>
              <strong className="text-4xl font-display font-black text-slate-900 block mt-1">{calculateAverageTime()} Phút</strong>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dựa trên logs chơi của học sinh</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Cửa Ải Thử Thách Khó Nhất</span>
              <strong className="text-4xl font-display font-black text-red-600 block mt-1">Trạm {calculateHardestStation()}</strong>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span>Học sinh ghi nhận nhiều lỗi nhất</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-5 border border-emerald-100 rounded-2xl shadow-emerald-100/50 block shadow text-left bg-gradient-to-br from-white to-emerald-50/20">
              <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-extrabold block">AI Master Teacher Coach</span>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Nhấn tư vấn để Gemini tự động bóc phân tích chuyên đề yếu của lớp học.
              </p>
              <button
                onClick={handleGenerateReportSuggestions}
                disabled={loadingReport}
                className="mt-3 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 py-1.5 px-4 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Yêu cầu AI tư vấn
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Leaderboard Table (Left 7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
                Bảng xếp hạng Nhà Thám Hiểm xuất sắc thực tế
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="p-3 rounded-l-lg">Học sinh</th>
                      <th className="p-3">Lớp</th>
                      <th className="p-3 text-center">Tổng Điểm</th>
                      <th className="p-3 text-center">Thời Gian Làm</th>
                      <th className="p-3 text-right rounded-r-lg">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getLeaderboard().map((student, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                            idx === 1 ? 'bg-slate-100 text-slate-800' :
                            'bg-amber-50 text-amber-900'
                          }`}>
                            {idx + 1}
                          </span>
                          {student.name}
                        </td>
                        <td className="p-3 font-mono text-slate-600">{student.className}</td>
                        <td className="p-3 text-center font-bold text-emerald-600">{student.score} Đ</td>
                        <td className="p-3 text-center font-mono text-slate-600">{student.timeTakenMinutes} phút</td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold py-0.5 px-2 rounded-full border border-emerald-200">
                            Hoàn thành
                          </span>
                        </td>
                      </tr>
                    ))}
                    {getLeaderboard().length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-slate-400 py-8 text-center font-medium italic">
                          Chưa có học sinh nào hoàn thành. Hãy gửi đường link học sinh trải nghiệm để thu hoạch kết quả!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Advisor Container (Right 5 cols) - REQUIREMENT FORMAT B */}
            <div className="lg:col-span-5 bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-2 right-2 text-8xl opacity-5 pointer-events-none">🧙</div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span>AI Game Master Advisor</span>
                </h3>

                <div className="text-xs text-slate-300 leading-relaxed font-sans max-h-[380px] overflow-y-auto space-y-4 whitespace-pre-wrap">
                  {loadingReport ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-yellow-400" />
                      <span className="text-xs text-slate-400 italic">Gemini AI đang dò tìm logs cấu phần toán học học sinh...</span>
                    </div>
                  ) : reportMarkdown ? (
                    <div className="prose prose-invert prose-xs text-slate-200 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                      {/* Standard Markdown elements parser */}
                      <div className="space-y-4">
                        {reportMarkdown.split('\n').map((line, lIdx) => {
                          if (line.startsWith('###')) {
                            return <h4 key={lIdx} className="text-sm font-bold text-yellow-400 mt-4 uppercase border-b border-slate-800 pb-1">{line.replace('###', '')}</h4>;
                          }
                          if (line.startsWith('* **') || line.startsWith('- **')) {
                            const cleanLine = line.replace(/^[\s*-]+/, '');
                            const splitBold = cleanLine.split('**');
                            return (
                              <p key={lIdx} className="pl-3 border-l-2 border-emerald-500 py-0.5">
                                <span className="font-bold text-slate-200">{splitBold[1]}</span>
                                <span>{splitBold.slice(2).join('**')}</span>
                              </p>
                            );
                          }
                          return <p key={lIdx} className="leading-relaxed text-slate-300">{line}</p>;
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                      <p className="font-medium text-xs">Phân tích chuyên sâu tự động hóa học tập từ dữ liệu của học sinh Phạm Văn Dũng.</p>
                      <button
                        onClick={handleGenerateReportSuggestions}
                        className="mt-4 bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold px-4 py-2 rounded-lg transition"
                      >
                        NÀO TỬ VẤN COCHING NGAY
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <footer className="mt-4 text-[10px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between">
                <span>Dữ liệu logs: {studentLogs.length} bản ghi</span>
                <span>Báo cáo thuộc: PV Dũng</span>
              </footer>
            </div>

          </div>

        </div>
      )}

      {/* TAB: Questions Spreadsheet Manual Editor */}
      {activeTab === 'questions-bank' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ngân hàng 22 Trạm đề chi tiết</h3>
              <p className="text-slate-400 text-[11px] font-medium mt-0.5">Giáo viên có thể bấm trực tiếp nút CHỈNH SỬA để biên tập đề học của từng trạm.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs divide-y divide-slate-150">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-250">
                  <th className="p-3 w-16 text-center">Trạm</th>
                  <th className="p-3 w-32 border-l border-slate-200">Sinh Cảnh</th>
                  <th className="p-3 w-28">Thể Loại</th>
                  <th className="p-3">Nội Dung Đề Bài</th>
                  <th className="p-3 w-40">Đáp Án Đúng</th>
                  <th className="p-3 w-20 text-center rounded-r-lg">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {questions.map((q) => (
                  <tr key={q.station} className="hover:bg-slate-50/40">
                    <td className="p-3 text-center">
                      <span className="bg-slate-900 text-white font-bold w-6 h-6 rounded-full inline-flex items-center justify-center font-mono">
                        {q.station}
                      </span>
                    </td>
                    <td className="p-3 border-l border-slate-200 font-semibold">{q.landscape}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-700 uppercase">{q.type}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">
                        <MathAndImageRenderer text={q.questionText} image={q.questionImage} imageMaxHeight="max-h-16" className="text-xs md:text-sm" />
                      </div>
                      {q.options && (
                        <div className="flex gap-2 mt-2 flex-wrap items-center">
                          {q.options.map((opt, i) => (
                            <div key={i} className="bg-slate-100 text-slate-700 text-[11px] py-1 px-2.5 rounded-lg font-medium border border-slate-200 max-w-xs">
                              <MathAndImageRenderer text={opt} className="text-[11px]" />
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 bg-emerald-50/20">
                      <div className="font-bold text-emerald-700 text-xs md:text-sm">
                        <MathAndImageRenderer text={q.correctAnswer} className="text-xs font-bold text-emerald-700" />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => startEditQuestion(q)}
                        className="bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-slate-700 hover:text-slate-950 transition cursor-pointer"
                        title="Chỉnh sửa câu hỏi trạm này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Card: Teacher completely finished making exam papers, hit Publish! */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 font-sans">
                <span>📢 Bạn đã chế tác & kiểm tra xong nội dung 22 trạm?</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Nhấp nút bên phải để chính thức <b>Xuất Bản & Phát Hành</b> bộ đề này làm nhiệm vụ trực tuyến cho học sinh làm bài thám hiểm.
              </p>
            </div>
            <div className="shrink-0">
              {isGameActive ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1 font-sans">
                    🟢 Đang Trực Tuyến
                  </span>
                  <button
                    onClick={() => {
                      onChangeGameActive?.(false);
                      setFeedbackMessage({ type: 'success', text: '⏸️ Đã tạm ngưng xuất bản đề thi.' });
                    }}
                    className="text-[11px] text-red-500 hover:text-red-700 font-bold bg-white border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    Tạm dừng
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onChangeGameActive?.(true);
                    setFeedbackMessage({ type: 'success', text: '🚀 Xuất bản đề thi thành công! Học sinh đã có thể truy cập thám hiểm trực tuyến.' });
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-705 text-white font-extrabold text-xs uppercase rounded-xl transition shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5 animate-pulse"
                >
                  🚀 Xuất Bản Đề Thi Ngay
                </button>
              )}
            </div>
          </div>

          {/* Inline Edit Modal/Drawer overlay */}
          <AnimatePresence>
            {editingStation !== null && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-white border rounded-2xl shadow-xl max-w-2xl w-full p-6 text-left space-y-4"
                >
                  <h3 className="text-base font-bold text-slate-950 flex items-center justify-between border-b pb-2">
                    <span>BIÊN TẬP THÔNG SỐ: TRẠM {editingStation}</span>
                    <button onClick={() => setEditingStation(null)} className="text-slate-400 hover:text-slate-950 font-bold">✕</button>
                  </h3>

                  <div className="space-y-4 text-xs text-slate-700 max-h-[68vh] overflow-y-auto pr-2 scrollbar-thin">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nội dung câu hỏi</label>
                      <textarea
                        value={editForm.questionText}
                        onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900 bg-slate-50"
                      />
                      {editForm.questionText && (
                        <div className="mt-2 p-2.5 bg-indigo-50/40 border border-indigo-100 rounded-lg">
                          <span className="block text-[9px] uppercase font-bold text-indigo-600 mb-1">🔍 Xem trước hiển thị công thức toán:</span>
                          <MathAndImageRenderer text={editForm.questionText} className="text-xs text-slate-800" />
                        </div>
                      )}
                      <div className="mt-2 text-slate-900">
                        <ImageUploader 
                          label="Tải Ảnh đề bài (Đồ thị / Hình vẽ hình học không gian / Công thức toán phức tạp)" 
                          value={editForm.questionImage} 
                          onChange={(val) => setEditForm({ ...editForm, questionImage: val })} 
                        />
                      </div>
                    </div>

                    {editForm.options.length > 0 && (
                      <div className="space-y-2.5 border-t pt-3 border-slate-100">
                        <label className="block text-[10px] uppercase font-bold text-slate-500">Các lựa chọn phương án & Hình ảnh (Có thể điền text, tải ảnh, hoặc cả hai)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {editForm.options.map((opt, oIdx) => {
                            const labels = ['A', 'B', 'C', 'D'];
                            return (
                              <div key={oIdx} className="p-2.5 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                                <span className="font-bold text-[10px] text-indigo-700 block">Phương án {labels[oIdx]} (Text)</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...editForm.options];
                                    newOpts[oIdx] = e.target.value;
                                    setEditForm({ ...editForm, options: newOpts });
                                  }}
                                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-xs text-slate-900 bg-white"
                                />
                                <ImageUploader 
                                  label={`Ảnh đính kèm cho phương án ${labels[oIdx]}`} 
                                  value={editForm.optionsImages?.[oIdx]} 
                                  onChange={(val) => {
                                    const newImgOpts = [...(editForm.optionsImages || [])];
                                    newImgOpts[oIdx] = val;
                                    setEditForm({ ...editForm, optionsImages: newImgOpts });
                                  }} 
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {editForm.subStatements.length > 0 && (
                      <div className="space-y-3 border-t pt-3 border-slate-100">
                        <label className="block text-[10px] uppercase font-bold text-slate-500">Mệnh đề phụ Đúng / Sai & Hình ảnh đính kèm</label>
                        <div className="space-y-3">
                          {editForm.subStatements.map((sub, sIdx) => {
                            return (
                              <div key={sIdx} className="p-3 border border-slate-200 rounded-xl space-y-2.5 bg-slate-50/70">
                                <div className="flex justify-between items-center bg-slate-100/55 p-1.5 rounded-lg">
                                  <span className="font-extrabold text-xs text-violet-700">Mệnh đề phụ {sub.label}</span>
                                  <select
                                    value={sub.correctAnswer}
                                    onChange={(e) => {
                                      const newSubs = [...editForm.subStatements];
                                      newSubs[sIdx].correctAnswer = e.target.value as 'Đúng' | 'Sai';
                                      setEditForm({ ...editForm, subStatements: newSubs });
                                    }}
                                    className="border border-slate-200 rounded-md py-1 px-2 font-bold text-xs bg-white text-slate-800"
                                  >
                                    <option value="Đúng">🟢 Đúng</option>
                                    <option value="Sai">🔴 Sai</option>
                                  </select>
                                </div>
                                <input
                                  type="text"
                                  value={sub.text}
                                  onChange={(e) => {
                                    const newSubs = [...editForm.subStatements];
                                    newSubs[sIdx].text = e.target.value;
                                    setEditForm({ ...editForm, subStatements: newSubs });
                                  }}
                                  className="w-full border border-slate-205 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-xs text-slate-900 bg-white"
                                  placeholder={`Nhập mệnh đề phụ ${sub.label}`}
                                />
                                <ImageUploader 
                                  label={`Ảnh minh họa cho mệnh đề phụ ${sub.label}`} 
                                  value={sub.subImage} 
                                  onChange={(val) => {
                                    const newSubs = [...editForm.subStatements];
                                    newSubs[sIdx].subImage = val;
                                    setEditForm({ ...editForm, subStatements: newSubs });
                                  }} 
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 border-t pt-3 border-slate-100">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Đáp án đúng chính xác</label>
                      <input
                        type="text"
                        value={editForm.correctAnswer}
                        onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900 bg-slate-50"
                      />
                    </div>

                    <div className="space-y-2 border-t pt-3 border-slate-100">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Lời giải đáp chi tiết từ Game Master</label>
                      <textarea
                        value={editForm.explanation}
                        onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900 bg-slate-50"
                      />
                      {editForm.explanation && (
                        <div className="mt-2 p-2.5 bg-indigo-50/40 border border-indigo-100 rounded-lg">
                          <span className="block text-[9px] uppercase font-bold text-indigo-600 mb-1">🔍 Xem trước hiển thị lời giải:</span>
                          <MathAndImageRenderer text={editForm.explanation} className="text-xs text-slate-800" />
                        </div>
                      )}
                      <div className="mt-1">
                        <ImageUploader 
                          label="Tải Ảnh đính kèm cho phần lý giải thích (Giải nghĩa đồ thị / Lập luận chi tiết)" 
                          value={editForm.explanationImage} 
                          onChange={(val) => setEditForm({ ...editForm, explanationImage: val })} 
                        />
                      </div>
                    </div>

                    {editingStation >= 17 && (
                      <div className="space-y-2 border-t pt-3 border-slate-100 font-sans">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Từ Khóa NLP đồng nghĩa bổ trợ (Cách nhau bằng dấu phẩy)</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: 36, ba mươi sáu, ba muoi sau"
                          value={editForm.keywords}
                          onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900 bg-slate-50"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-3">
                    <button
                      onClick={() => setEditingStation(null)}
                      className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-xs font-semibold"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSaveQuestionEdit}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB: Gemini AI Generative Tools */}
      {activeTab === 'gemini-tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section A: Prompt generative math generator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Tự động hóa sinh trọn vẹn đề thám hiểm 22 Trạm
            </h3>
            
            <p className="text-slate-500 text-xs leading-relaxed">
              Nhập khối lớp và chủ điểm toán học, Gemini sẽ thiết kế trọn bộ 22 thử thách toán học liên hoàn bao gồm: lý thuyết, tính nhanh, hình học, đố vui... tăng dần độ khó đúng theo sinh cảnh phân khu của game thám hiểm!
            </p>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Khối Lớp</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Khối lớp 6"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Thời Đại / Chủ Điểm Giáo dục</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Ôn thi học kỳ II hình học & số học"
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900 bg-slate-50"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateQuestions}
                disabled={generatingQuestions}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
                {generatingQuestions ? 'GEMINI AI ĐANG SÁNG TÁC 22 TRẠM...' : 'BẤM ĐỂ AI TỰ ĐỘNG SẢN XUẤT ĐỀ THI'}
              </button>
            </div>
          </div>

          {/* Section B: Document bóc tách (OCR / Doc simulated parser) chia làm 3 Thử Thách */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              Tải tệp đề bài & OCR cho từng thử thách
            </h3>

            <p className="text-slate-500 text-xs leading-relaxed">
              Hãy chọn tệp tin (hỗ trợ **Word .docx, PDF, hình ảnh PNG/JPG**) hoặc dán văn bản đề bài tương ứng với từng Thử thách bên dưới. Trình Game Master AI sẽ đọc quét (OCR), tự động viết lời giải toán học chi tiết và nạp thông minh vào các trạm phù hợp!
            </p>

            {/* Subsections for each Challenge */}
            <div className="space-y-6">

              {/* CHALLENGE 1 CARD */}
              <div className="border border-emerald-100 bg-emerald-50/10 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                    🌲 THỬ THÁCH 1: TRẮC NGHIỆM A, B, C, D (Gồm 12 câu)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadSampleFileOfChallenge('challenge1')}
                      className="text-slate-500 hover:text-emerald-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                      title="Tải đề bài mẫu thử thách 1"
                    >
                      <Download className="w-3 h-3" /> Tải mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopySampleChallenge('challenge1')}
                      className="text-slate-500 hover:text-emerald-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedChallengeText === 'challenge1' ? 'Đã chép!' : 'Chép mẫu'}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-550 leading-relaxed font-medium space-y-1">
                  <p>• Trạm áp dụng: <b>Trạm 1 đến Trạm 12</b> (Phân khu Rừng rậm).</p>
                  <p>• Quy tắc định dạng đề: Đáp án đúng sẽ được <u>gạch chân</u> kí tự chữ cái A, B, C hoặc D (Ví dụ: <u>A</u>. $24$, B. $12$, ...).</p>
                  <p className="text-emerald-700 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 text-[10.5px]">
                    💡 <b>Lời giải:</b> Quý thầy cô không cần viết lời giải, AI sẽ tự động viết lời giải mẫu mực đầy đủ.
                  </p>
                </div>

                {/* File input C1 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-20 border border-emerald-200 border-dashed rounded-xl cursor-pointer bg-emerald-50/10 hover:bg-emerald-50/30 transition-all p-2 text-center">
                      <UploadCloud className="w-5 h-5 text-emerald-500 mb-0.5" />
                      <span className="text-[11px] text-emerald-900 font-semibold">Tải đề Thử thách 1 (Word, PDF, Ảnh)</span>
                      <input 
                        type="file" 
                        accept=".docx,.pdf,.png,.jpg,.jpeg" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFileToUpload1(e.target.files[0]);
                            setUploadFileName1(e.target.files[0].name);
                          }
                        }} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {uploadFileName1 && (
                    <div className="bg-white border border-emerald-100 rounded-lg p-2 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-medium truncate">{uploadFileName1}</span>
                      <button 
                        type="button" 
                        onClick={() => { setFileToUpload1(null); setUploadFileName1(''); }}
                        className="text-red-500 font-bold px-1.5"
                      >✕</button>
                    </div>
                  )}

                  {fileToUpload1 && (
                    <button
                      type="button"
                      onClick={() => handleFileUploadAndImport('challenge1', fileToUpload1)}
                      disabled={fileProcessing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {fileProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      BẮT ĐẦU QUÉT FILE THỬ THÁCH 1
                    </button>
                  )}
                </div>

                {/* Text area C1 */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Hoặc dán đề bài Trắc nghiệm nhanh:</span>
                  <textarea
                    placeholder="Dán đề bài trắc nghiệm nháp có gạch chân đáp án vào đây..."
                    value={pastedContent1}
                    onChange={(e) => setPastedContent1(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
                  />
                  {pastedContent1.trim() && (
                    <button
                      onClick={() => handleOcrImport('challenge1', pastedContent1)}
                      disabled={processingOcr}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {processingOcr ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                      OCR TỪ VĂN BẢN TRẮC NGHIỆM DÁN
                    </button>
                  )}
                </div>
              </div>


              {/* CHALLENGE 2 CARD */}
              <div className="border border-indigo-100 bg-indigo-50/10 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-indigo-200">
                    ❄️ THỬ THÁCH 2: CÂU HỎI ĐÚNG / SAI 4 Ý (Gồm 4 câu)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadSampleFileOfChallenge('challenge2')}
                      className="text-slate-500 hover:text-indigo-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Tải mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopySampleChallenge('challenge2')}
                      className="text-slate-500 hover:text-indigo-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedChallengeText === 'challenge2' ? 'Đã chép!' : 'Chép mẫu'}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-550 leading-relaxed font-medium space-y-1">
                  <p>• Trạm áp dụng: <b>Trạm 13 đến Trạm 16</b> (Phân khu Hang động).</p>
                  <p>• Quy tắc định dạng đề: Mỗi câu gồm đúng 4 mệnh đề phụ. Ý phụ nào ĐÚNG được <u>gạch chân</u> kí tự chữ cái định mục (Ví dụ: <u>a)</u> Đa thức có nghiệm, b) Phương trình vô nghiệm, ...).</p>
                  <p className="text-indigo-700 bg-indigo-50 p-1.5 rounded-lg border border-indigo-100 text-[10.5px]">
                    💡 <b>Lời giải:</b> Quý thầy cô không cần soạn lời giải, AI sẽ tự động phân tích lý giải lập luận chi tiết.
                  </p>
                </div>

                {/* File input C2 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-20 border border-indigo-200 border-dashed rounded-xl cursor-pointer bg-indigo-50/10 hover:bg-indigo-50/30 transition-all p-2 text-center">
                      <UploadCloud className="w-5 h-5 text-indigo-500 mb-0.5" />
                      <span className="text-[11px] text-indigo-900 font-semibold">Tải đề Thử thách 2 (Word, PDF, Ảnh)</span>
                      <input 
                        type="file" 
                        accept=".docx,.pdf,.png,.jpg,.jpeg" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFileToUpload2(e.target.files[0]);
                            setUploadFileName2(e.target.files[0].name);
                          }
                        }} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {uploadFileName2 && (
                    <div className="bg-white border border-indigo-100 rounded-lg p-2 flex items-center justify-between text-xs">
                      <span className="text-indigo-800 font-medium truncate">{uploadFileName2}</span>
                      <button 
                        type="button" 
                        onClick={() => { setFileToUpload2(null); setUploadFileName2(''); }}
                        className="text-red-500 font-bold px-1.5"
                      >✕</button>
                    </div>
                  )}

                  {fileToUpload2 && (
                    <button
                      type="button"
                      onClick={() => handleFileUploadAndImport('challenge2', fileToUpload2)}
                      disabled={fileProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {fileProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      BẮT ĐẦU QUÉT FILE THỬ THÁCH 2
                    </button>
                  )}
                </div>

                {/* Text area C2 */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Hoặc dán đề bài Đúng / Sai nhanh:</span>
                  <textarea
                    placeholder="Dán đề bài Đúng Sai có gạch chân các kí tự a, b, c, d chính xác vào đây..."
                    value={pastedContent2}
                    onChange={(e) => setPastedContent2(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                  />
                  {pastedContent2.trim() && (
                    <button
                      onClick={() => handleOcrImport('challenge2', pastedContent2)}
                      disabled={processingOcr}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {processingOcr ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                      OCR TỪ VĂN BẢN ĐÚNG/SAI DÂN
                    </button>
                  )}
                </div>
              </div>


              {/* CHALLENGE 3 CARD */}
              <div className="border border-amber-100 bg-amber-50/10 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-amber-200">
                    🌫️ THỬ THÁCH 3: CÂU HỎI TRẢ LỜI NGẮN (Gồm 6 câu)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadSampleFileOfChallenge('challenge3')}
                      className="text-slate-500 hover:text-amber-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Tải mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopySampleChallenge('challenge3')}
                      className="text-slate-500 hover:text-amber-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedChallengeText === 'challenge3' ? 'Đã chép!' : 'Chép mẫu'}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-550 leading-relaxed font-medium space-y-1">
                  <p>• Trạm áp dụng: <b>Trạm 17 đến Trạm 22</b> (Phân khu Thung lũng sương mù).</p>
                  <p>• Quy tắc định dạng đề: Đáp án được ghi phía dưới câu hỏi dưới dạng: <code className="bg-amber-50 text-amber-950 font-bold px-1 rounded">Đáp án: [giá trị]</code>.</p>
                  <p className="text-red-700 bg-red-50 p-1.5 rounded-lg border border-red-100 text-[10.5px]">
                    ⚠️ <b>QUY ĐỊNH BẮT BUỘC:</b> Chỉ điền kết quả là SỐ. Nếu là số thập phân thì bắt buộc dùng dấu phẩy (Ví dụ: "Đáp án: 2,5" hoặc "Đáp án: -1,2").
                  </p>
                </div>

                {/* File input C3 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-20 border border-amber-200 border-dashed rounded-xl cursor-pointer bg-amber-50/10 hover:bg-amber-50/30 transition-all p-2 text-center">
                      <UploadCloud className="w-5 h-5 text-amber-500 mb-0.5" />
                      <span className="text-[11px] text-amber-900 font-semibold">Tải đề Thử thách 3 (Word, PDF, Ảnh)</span>
                      <input 
                        type="file" 
                        accept=".docx,.pdf,.png,.jpg,.jpeg" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFileToUpload3(e.target.files[0]);
                            setUploadFileName3(e.target.files[0].name);
                          }
                        }} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {uploadFileName3 && (
                    <div className="bg-white border border-amber-100 rounded-lg p-2 flex items-center justify-between text-xs">
                      <span className="text-amber-800 font-medium truncate">{uploadFileName3}</span>
                      <button 
                        type="button" 
                        onClick={() => { setFileToUpload3(null); setUploadFileName3(''); }}
                        className="text-red-500 font-bold px-1.5"
                      >✕</button>
                    </div>
                  )}

                  {fileToUpload3 && (
                    <button
                      type="button"
                      onClick={() => handleFileUploadAndImport('challenge3', fileToUpload3)}
                      disabled={fileProcessing}
                      className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {fileProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      BẮT ĐẦU QUÉT FILE THỬ THÁCH 3
                    </button>
                  )}
                </div>

                {/* Text area C3 */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Hoặc dán đề bài ngắn tự luận nhanh:</span>
                  <textarea
                    placeholder="Dán câu hỏi kèm 'Đáp án:...' ngay cuối từng câu..."
                    value={pastedContent3}
                    onChange={(e) => setPastedContent3(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-800"
                  />
                  {pastedContent3.trim() && (
                    <button
                      onClick={() => handleOcrImport('challenge3', pastedContent3)}
                      disabled={processingOcr}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {processingOcr ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      OCR TỪ VĂN BẢN TRẢ LỜI NGẮN DÁN
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === 'password-settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings2 className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">
              Cài Đặt & Thay Đổi Mật Khẩu Đăng Nhập
            </h3>
          </div>

          <p className="text-slate-500 text-xs leading-relaxed">
            Thầy có thể đặt mật khẩu mới của riêng mình để bảo mật phòng tài liệu tốt hơn. 
            Mật khẩu mới này sẽ được lưu trữ an toàn trên thiết bị của Thầy. Nếu chưa đổi mật khẩu, 
            Thầy vẫn có thể sử dụng mật khẩu mặc định là <b>DUNGMATH</b> hoặc <b>123456</b>.
          </p>

          <form onSubmit={(e) => {
            e.preventDefault();
            const customStoredPass = localStorage.getItem('teacher_password');
            const enteredCurrent = currentPasswordInput.trim();
            const isValidCurrent = (customStoredPass && enteredCurrent === customStoredPass) || 
                                   (!customStoredPass && (enteredCurrent.toUpperCase() === 'DUNGMATH' || enteredCurrent === '123456'));

            if (!isValidCurrent) {
              setFeedbackMessage({ type: 'error', text: 'Mật khẩu hiện tại chưa chính xác!' });
              return;
            }

            if (!newPasswordInput.trim()) {
              setFeedbackMessage({ type: 'error', text: 'Mật khẩu mới không được để trống!' });
              return;
            }

            if (newPasswordInput !== confirmNewPasswordInput) {
              setFeedbackMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp với mật khẩu mới!' });
              return;
            }

            localStorage.setItem('teacher_password', newPasswordInput.trim());
            setFeedbackMessage({ type: 'success', text: '🔑 Đổi mật khẩu quản trị thành công! Thầy hãy ghi nhớ mật khẩu mới này nhé.' });
            
            setCurrentPasswordInput('');
            setNewPasswordInput('');
            setConfirmNewPasswordInput('');
          }} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Mật khẩu hiện tại</label>
              <input
                type="password"
                placeholder="Nhập DUNGMATH hoặc mật khẩu cũ của Thầy"
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-semibold bg-slate-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới muốn đặt"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-semibold bg-slate-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới để xác nhận"
                value={confirmNewPasswordInput}
                onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-semibold bg-slate-50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
            >
              Cập nhật mật khẩu mới
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
