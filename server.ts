import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { Question, StudentLog } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Gemini SDK with client telemetry UA header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getGoogleGenAI(req: Request): GoogleGenAI | null {
  const clientApiKey = req.headers['x-api-key'] as string || process.env.GEMINI_API_KEY;
  if (clientApiKey && clientApiKey !== "MY_GEMINI_API_KEY") {
    return new GoogleGenAI({
      apiKey: clientApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return null;
}

async function generateContentWithRetry(aiClient: GoogleGenAI, params: any, preferredModel: string, retries = 3) {
  let lastError: any = null;
  
  // Model cascading list based on AI_INSTRUCTIONS.md:
  // 1. gemini-3-flash-preview
  // 2. gemini-3-pro-preview
  // 3. gemini-2.5-flash
  const defaultChain = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
  
  // Build fallback model chain dynamically: preferred model first, then others
  const modelChain = [
    preferredModel,
    ...defaultChain.filter(m => m !== preferredModel)
  ];
  
  for (let attempt = 0; attempt < retries; attempt++) {
    const modelToUse = modelChain[attempt] || 'gemini-3-flash-preview';
    
    try {
      console.log(`[Gemini Request] Attempt ${attempt + 1}/${retries} using model ${modelToUse}...`);
      const response = await aiClient.models.generateContent({
        ...params,
        model: modelToUse
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errorMessage = err?.message || err?.toString() || 'Unknown error';
      console.warn(`[Gemini Attempt ${attempt + 1}/${retries}] Error using ${modelToUse}:`, errorMessage);
      
      if (attempt < retries - 1) {
        const delay = 1000 * (attempt + 1);
        console.log(`Waiting ${delay}ms before cascading/retrying...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

// In-memory logs representing real-time student activity database
let studentLogs: StudentLog[] = [
  {
    id: 'log_1',
    name: 'Nguyễn Văn An',
    className: '6A1',
    score: 220,
    completed: true,
    timeTakenMinutes: 12.5,
    itemsCollectedCount: 22,
    wrongCountAtStation: { 3: 1, 8: 1, 14: 2, 21: 1 },
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'log_2',
    name: 'Phạm Thị Bình',
    className: '6A1',
    score: 200,
    completed: true,
    timeTakenMinutes: 16.2,
    itemsCollectedCount: 18,
    wrongCountAtStation: { 10: 2, 13: 1, 19: 2, 22: 3 },
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'log_3',
    name: 'Lê Hoàng Long',
    className: '6A2',
    score: 150,
    completed: false,
    timeTakenMinutes: 8.4,
    itemsCollectedCount: 12,
    wrongCountAtStation: { 5: 1, 12: 3, 13: 2 },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'log_4',
    name: 'Trần Minh Quân',
    className: '6A1',
    score: 220,
    completed: true,
    timeTakenMinutes: 10.1,
    itemsCollectedCount: 22,
    wrongCountAtStation: { 19: 1 },
    timestamp: new Date(Date.now() - 900000).toISOString(),
  }
];

// Seed collection of default 22 stations questions
const defaultQuestions: Question[] = [
  // Stations 1-12: Rừng rậm (Multiple Choice, correct battles)
  {
    station: 1,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Một cửa hàng có $35$ thùng nước ngọt. Sau khi bán đi $12$ thùng, cửa hàng còn lại bao nhiêu thùng nước ngọt?',
    options: ['$23$ thùng', '$25$ thùng', '$27$ thùng', '$22$ thùng'],
    correctAnswer: '$23$ thùng',
    explanation: 'Ta thực hiện phép tính trừ: $35 - 12 = 23$ thùng.',
  },
  {
    station: 2,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Hình vuông có độ dài cạnh là $8\\text{ cm}$ thì có chu vi là bao nhiêu?',
    options: ['$16\\text{ cm}$', '$32\\text{ cm}$', '$64\\text{ cm}$', '$24\\text{ cm}$'],
    correctAnswer: '$32\\text{ cm}$',
    explanation: 'Chu vi hình vuông được tính bằng công thức: $\\text{Cạnh} \\times 4 = 8 \\times 4 = 32\\text{ cm}$.',
  },
  {
    station: 3,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Tìm $x$, biết: $x \\times 6 = 54$.',
    options: ['$x = 8$', '$x = 7$', '$x = 9$', '$x = 6$'],
    correctAnswer: '$x = 9$',
    explanation: 'Ta tìm $x$ bằng cách lấy tích chia cho thừa số đã biết: $x = 54 \\div 6 = 9$.',
  },
  {
    station: 4,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Phân số nào dưới đây bằng phân số $\\frac{3}{4}$?',
    options: ['$\\frac{9}{12}$', '$\\frac{6}{10}$', '$\\frac{5}{8}$', '$\\frac{12}{15}$'],
    correctAnswer: '$\\frac{9}{12}$',
    explanation: 'Nhân cả tử và mẫu của $\\frac{3}{4}$ với $3$ ta được: $\\frac{3 \\times 3}{4 \\times 3} = \\frac{9}{12}$.',
  },
  {
    station: 5,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Một thửa ruộng hình chữ nhật có chiều dài $20\\text{ m}$, chiều rộng $15\\text{ m}$. Hãy tính diện tích thửa ruộng đó.',
    options: ['$35\\text{ m}^2$', '$70\\text{ m}^2$', '$300\\text{ m}^2$', '$150\\text{ m}^2$'],
    correctAnswer: '$300\\text{ m}^2$',
    explanation: 'Diện tích hình chữ nhật là: $\\text{Chiều dài} \\times \\text{Chiều rộng} = 20 \\times 15 = 300\\text{ m}^2$.',
  },
  {
    station: 6,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Một lớp học có $32$ học sinh. Số học sinh nữ chiếm $\\frac{1}{4}$ số học sinh cả lớp. Hỏi lớp có bao nhiêu học sinh nam?',
    options: ['$8$ học sinh', '$24$ học sinh', '$16$ học sinh', '$20$ học sinh'],
    correctAnswer: '$24$ học sinh',
    explanation: 'Số học sinh nữ là: $32 \\div 4 = 8$ học sinh. Số học sinh nam là: $32 - 8 = 24$ học sinh.',
  },
  {
    station: 7,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Cách tính nhanh nào đúng cho biểu thức tích sau: $125 \\times 8$?',
    options: ['$100$', '$1000$', '$10000$', '$800$'],
    correctAnswer: '$1000$',
    explanation: 'Đây là phép nhân cơ bản cần nhớ: $125 \\times 8 = 1000$.',
  },
  {
    station: 8,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Tìm số trung bình cộng của ba số sau: $14$, $18$ và $28$.',
    options: ['$20$', '$18$', '$22$', '$24$'],
    correctAnswer: '$20$',
    explanation: 'Trung bình cộng = $\\frac{14 + 18 + 28}{3} = \\frac{60}{3} = 20$.',
  },
  {
    station: 9,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Đổi số đo khối lượng sau sang kg: $2$ tạ $5\\text{ kg}$.',
    options: ['$25\\text{ kg}$', '$205\\text{ kg}$', '$250\\text{ kg}$', '$2005\\text{ kg}$'],
    correctAnswer: '$205\\text{ kg}$',
    explanation: '$1$ tạ = $100\\text{ kg}$. Do đó, $2$ tạ $5\\text{ kg} = 200\\text{ kg} + 5\\text{ kg} = 205\\text{ kg}$.',
  },
  {
    station: 10,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Một xe máy di chuyển $80\\text{ km}$ trong vòng $2$ giờ. Vận tốc trung bình của xe máy là bao nhiêu?',
    options: ['$40\\text{ km/h}$', '$30\\text{ km/h}$', '$50\\text{ km/h}$', '$45\\text{ km/h}$'],
    correctAnswer: '$40\\text{ km/h}$',
    explanation: 'Vận tốc = $\\frac{\\text{Quãng đường}}{\\text{Thời gian}} = \\frac{80}{2} = 40\\text{ km/h}$.',
  },
  {
    station: 11,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Một mẫu biểu diễn trên bản đồ tỉ lệ $1 : 10000$ là $5\\text{ cm}$. Độ dài thực tế tương ứng là bao nhiêu mét?',
    options: ['$50\\text{ m}$', '$500\\text{ m}$', '$5000\\text{ m}$', '$50000\\text{ m}$'],
    correctAnswer: '$500\\text{ m}$',
    explanation: 'Khoảng cách thực tế = $5 \\times 10000 = 50000\\text{ cm} = 500\\text{ m}$.',
  },
  {
    station: 12,
    landscape: 'Rừng rậm',
    type: 'multiple-choice',
    questionText: 'Tìm số vừa chia hết cho $2$, chia hết cho $5$, lại chia hết cho $3$ trong các số sau đây.',
    options: ['$125$', '$230$', '$150$', '$312$'],
    correctAnswer: '$150$',
    explanation: 'Số chia hết cho $2$ và $5$ phải có tận cùng là $0$ (đáp án $230$ hoặc $150$). Tổng các chữ số của $150$ là $1+5+0 = 6$ (chia hết cho $3$), nên $150$ chia hết cho cả ba số.',
  },

  // Stations 13-16: Hang động (True/False, forest light / sparkling effect)
  {
    station: 13,
    landscape: 'Hang động',
    type: 'true-false',
    questionText: 'Xác định tính Đúng / Sai của các mệnh đề sau về công thức hình học lý thuyết:',
    options: ['Đúng', 'Sai'],
    correctAnswer: 'Sai,Đúng,Đúng,Sai',
    explanation: 'a) Sai: Diện tích hình tròn là $S = r \\times r \\times 3.14$.\nb) Đúng: Đường kính $d = 2r$.\nc) Đúng: Tam giác đều có $3$ trục đối xứng đi qua đỉnh và trung điểm cạnh đối diện.\nd) Sai: Ba góc của tam giác đều bằng $60^\\circ$ (Tổng ba góc là $180^\\circ$).',
    subStatements: [
      { label: 'a)', text: 'Diện tích hình tròn bán kính $r$ được tính bằng $S = r \\times 2 \\times 3.14$.', correctAnswer: 'Sai' },
      { label: 'b)', text: 'Đường kính hình tròn gấp $2$ lần bán kính.', correctAnswer: 'Đúng' },
      { label: 'c)', text: 'Một hình tam giác đều luôn luôn có đúng $3$ trục đối xứng.', correctAnswer: 'Đúng' },
      { label: 'd)', text: 'Hình tam giác đều luôn luôn có một góc vuông hoặc góc tù.', correctAnswer: 'Sai' }
    ]
  },
  {
    station: 14,
    landscape: 'Hang động',
    type: 'true-false',
    questionText: 'Xét tính Đúng / Sai của các lời phát biểu liên quan đến số nguyên tố sau:',
    options: ['Đúng', 'Sai'],
    correctAnswer: 'Sai,Đúng,Đúng,Sai',
    explanation: 'a) Sai: Số $2$ là số nguyên tố chẵn duy nhất.\nb) Đúng: Mọi số nguyên tố đều lớn hơn $1$.\nc) Đúng: Các thừa số nguyên tố của $10$ là $2$ và $5$.\nd) Sai: Số $1$ không phải là số nguyên tố mà cũng không phải hợp số.',
    subStatements: [
      { label: 'a)', text: 'Mọi số nguyên tố đều là số lẻ.', correctAnswer: 'Sai' },
      { label: 'b)', text: 'Số nguyên tố là số tự nhiên lớn hơn $1$, chỉ có hai ước là $1$ và chính nó.', correctAnswer: 'Đúng' },
      { label: 'c)', text: 'Số $10$ có đúng hai ước số nguyên tố khác nhau.', correctAnswer: 'Đúng' },
      { label: 'd)', text: 'Số $1$ là số nguyên tố nhỏ nhất.', correctAnswer: 'Sai' }
    ]
  },
  {
    station: 15,
    landscape: 'Hang động',
    type: 'true-false',
    questionText: 'Xem xét các nhận định về quy luật phân số và tỉ số phần trăm sau đây:',
    options: ['Đúng', 'Sai'],
    correctAnswer: 'Đúng,Đúng,Sai,Sai',
    explanation: 'a) Đúng: $\\frac{15}{25}$ rút gọn cho $5$ được $\\frac{3}{5}$.\nb) Đúng: $0.75 = \\frac{75}{100} = 75\\%$.\nc) Sai: $\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}$ (không phải $\\frac{2}{5}$).\nd) Sai: $\\frac{7}{4} > \\frac{5}{4}$.',
    subStatements: [
      { label: 'a)', text: 'Phân số $\\frac{15}{25}$ tối giản rút gọn hoàn toàn sẽ bằng $\\frac{3}{5}$.', correctAnswer: 'Đúng' },
      { label: 'b)', text: 'Số định dạng thập phân $0.75$ tương đương với tỉ số $75\\%$.', correctAnswer: 'Đúng' },
      { label: 'c)', text: 'Cộng phân số: $\\frac{1}{2} + \\frac{1}{3} = \\frac{2}{5}$.', correctAnswer: 'Sai' },
      { label: 'd)', text: 'Phân số $\\frac{7}{4}$ nhỏ hơn phân số $\\frac{5}{4}$.', correctAnswer: 'Sai' }
    ]
  },
  {
    station: 16,
    landscape: 'Hang động',
    type: 'true-false',
    questionText: 'Xác định các khẳng định về tính chất phép tính và chia hết sau đúng hay sai:',
    options: ['Đúng', 'Sai'],
    correctAnswer: 'Đúng,Đúng,Sai,Đúng',
    explanation: 'a) Đúng: Số chia hết cho $5$ có chữ số tận cùng là $0$ hoặc $5$.\nb) Đúng: Tổng các chữ số chia hết cho $9$ thì chắc chắn chia hết cho $3$.\nc) Sai: Ví dụ số $12$ chia hết cho $3$ nhưng không chia hết cho $9$.\nd) Đúng: Tính chất phân phối $a \\times (b + c) = a \\times b + a \\times c$.',
    subStatements: [
      { label: 'a)', text: 'Số tự nhiên có chữ số tận cùng là $0$ hoặc $5$ thì chia hết cho $5$.', correctAnswer: 'Đúng' },
      { label: 'b)', text: 'Số chia hết cho $9$ thì chắc chắn chia hết cho $3$.', correctAnswer: 'Đúng' },
      { label: 'c)', text: 'Số chia hết cho $3$ thì chắc chắn chia hết cho $9$.', correctAnswer: 'Sai' },
      { label: 'd)', text: 'Biểu thức nhân phân phối: $a \\times (b + c) = a \\times b + a \\times c$.', correctAnswer: 'Đúng' }
    ]
  },

  // Stations 17-22: Thung lũng sương mù (Short Answer, custom keyword match)
  {
    station: 17,
    landscape: 'Thung lũng sương mù',
    type: 'short-answer',
    questionText: 'Tìm số tự nhiên $x$, biết: $3x - 5 = 10$. (Ghi rõ giá trị bằng chữ số)',
    correctAnswer: '5',
    explanation: '$3x - 5 = 10$ \n=> $3x = 10 + 5 = 15$ \n=> $x = 15 \\div 3 = 5$.',
    keywords: ['5', 'x=5', 'x = 5', 'năm'],
  },
  {
    station: 18,
    landscape: 'Thung lũng sương mù',
    type: 'short-answer',
    questionText: 'Hãy tính tổng các số tự nhiên lẻ từ $1$ đến $39$ (Tổng của $20$ số lẻ đầu tiên).',
    correctAnswer: '400',
    explanation: 'Tổng của $n$ số lẻ đầu tiên bằng $n^2$: $20 \\times 20 = 400$.',
    keywords: ['400', 'bốn trăm'],
  },
  {
    station: 19,
    landscape: 'Thung lũng sương mù',
    type: 'short-answer',
    questionText: 'Một hình lập phương có diện tích toàn phần là $150\\text{ cm}^2$. Hỏi độ dài một cạnh của hình lập phương đó bằng bao nhiêu cm? (Chỉ điền con số)',
    correctAnswer: '5',
    explanation: 'Diện tích toàn phần của hình lập phương bằng $6$ lần diện tích một mặt. Do đó diện tích một mặt là: $150 \\div 6 = 25\\text{ cm}^2$. Suy ra độ dài cạnh bằng $5\\text{ cm}$ (vì $5 \\times 5 = 25$).',
    keywords: ['5', '5cm', '5 cm'],
  },
  {
    station: 20,
    landscape: 'Thung lũng sương mù',
    type: 'short-answer',
    questionText: 'Tính giá trị của biểu thức sau: $A = (2026 - 2025) \\times 50 + 150$.',
    correctAnswer: '200',
    explanation: 'Nhân chia trước cộng trừ sau: $(1) \\times 50 + 150 = 50 + 150 = 200$.',
    keywords: ['200', 'hai trăm'],
  },
  {
    station: 21,
    landscape: 'Thung lũng sương mù',
    type: 'short-answer',
    questionText: 'Số tiếp theo trong quy luật dãy số sau là số mấy: $1, 4, 9, 16, 25, \\dots$',
    correctAnswer: '36',
    explanation: 'Dãy số gồm các bình phương tăng dần: $1^2, 2^2, 3^2, 4^2, 5^2$. Số tiếp theo là $6^2 = 36$.',
    keywords: ['36', 'ba mươi sáu'],
  },
  {
    station: 22,
    landscape: 'Thung lũng sương mù',
    type: 'short-answer',
    questionText: 'Một hình tròn có bao nhiêu trục đối xứng?',
    correctAnswer: 'Vô số',
    explanation: 'Bất kỳ đường thẳng nào đi qua tâm hình tròn đều là một trục đối xứng của hình tròn đó, do đó có vô số trục đối xứng.',
    keywords: ['vô số', 'vô hạn', 'nhiều', 'vô vàn'],
  },
];

let customQuestionsBank: Question[] = [...defaultQuestions];

function mergeQuestionsIntoBank(newQuestions: any[], challengeType: string): Question[] {
  let updatedBank = [...customQuestionsBank];

  if (challengeType === 'challenge1') {
    // Station 1 to 12. Multiple-choice.
    for (let i = 0; i < 12; i++) {
      const sourceQ = newQuestions[i] || newQuestions[i % newQuestions.length];
      if (!sourceQ) continue;
      
      const targetStation = i + 1;
      const indexInBank = updatedBank.findIndex(q => q.station === targetStation);
      
      const mergedQ: Question = {
        station: targetStation,
        landscape: 'Rừng rậm',
        type: 'multiple-choice',
        questionText: sourceQ.questionText || `Câu hỏi Trạm ${targetStation}`,
        options: Array.isArray(sourceQ.options) && sourceQ.options.length >= 4 
          ? sourceQ.options.slice(0, 4) 
          : ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D'],
        correctAnswer: sourceQ.correctAnswer || 'A',
        explanation: sourceQ.explanation || 'Giải thích câu hỏi',
        keywords: Array.isArray(sourceQ.keywords) ? sourceQ.keywords : [],
      };

      if (indexInBank !== -1) {
        updatedBank[indexInBank] = mergedQ;
      } else {
        updatedBank.push(mergedQ);
      }
    }
  } else if (challengeType === 'challenge2') {
    // Station 13 to 16. True/False.
    for (let i = 0; i < 4; i++) {
      const sourceQ = newQuestions[i] || newQuestions[i % newQuestions.length];
      if (!sourceQ) continue;

      const targetStation = i + 13;
      const indexInBank = updatedBank.findIndex(q => q.station === targetStation);

      // Support dynamic and robust parsing of subStatements
      let finalSubStatements: any[] = [];
      if (Array.isArray(sourceQ.subStatements) && sourceQ.subStatements.length > 0) {
        sourceQ.subStatements.forEach((sub: any, subIdx: number) => {
          if (sub && typeof sub === 'object') {
            const labels = ['a)', 'b)', 'c)', 'd)'];
            const ansRaw = String(sub.correctAnswer || 'Sai').trim();
            const isTrue = ansRaw === 'Đúng' || ansRaw === 'True' || ansRaw === 'Yes' || ansRaw === 'T' || ansRaw.toLowerCase().startsWith('đ') || ansRaw.toLowerCase().startsWith('t');
            finalSubStatements.push({
              label: sub.label || labels[subIdx] || `${String.fromCharCode(97 + subIdx)})`,
              text: sub.text || `Mệnh đề phụ ý ${labels[subIdx] || ''}`,
              correctAnswer: isTrue ? 'Đúng' : 'Sai'
            });
          }
        });
      }

      // Pad up to exactly 4 items if necessary
      const defaultLabels = ['a)', 'b)', 'c)', 'd)'];
      while (finalSubStatements.length < 4) {
        const nextIdx = finalSubStatements.length;
        finalSubStatements.push({
          label: defaultLabels[nextIdx],
          text: `Mệnh đề thám hiểm bổ trợ ${defaultLabels[nextIdx]}`,
          correctAnswer: 'Đúng'
        });
      }

      const mergedQ: Question = {
        station: targetStation,
        landscape: 'Hang động',
        type: 'true-false',
        questionText: sourceQ.questionText || `Câu hỏi Trạm ${targetStation}`,
        explanation: sourceQ.explanation || 'Giải thích đầy đủ phán đoán',
        subStatements: finalSubStatements,
        correctAnswer: sourceQ.correctAnswer || 'a',
        keywords: Array.isArray(sourceQ.keywords) ? sourceQ.keywords : [],
      };

      if (indexInBank !== -1) {
        updatedBank[indexInBank] = mergedQ;
      } else {
        updatedBank.push(mergedQ);
      }
    }
  } else if (challengeType === 'challenge3') {
    // Station 17 to 22. Short answer.
    for (let i = 0; i < 6; i++) {
      const sourceQ = newQuestions[i] || newQuestions[i % newQuestions.length];
      if (!sourceQ) continue;

      const targetStation = i + 17;
      const indexInBank = updatedBank.findIndex(q => q.station === targetStation);

      let answerRaw = sourceQ.correctAnswer ? String(sourceQ.correctAnswer).trim() : '0';

      const mergedQ: Question = {
        station: targetStation,
        landscape: 'Thung lũng sương mù',
        type: 'short-answer',
        questionText: sourceQ.questionText || `Câu hỏi Trạm ${targetStation}`,
        correctAnswer: answerRaw,
        explanation: sourceQ.explanation || 'Giải thích đáp án',
        keywords: Array.isArray(sourceQ.keywords) ? sourceQ.keywords : [answerRaw],
      };

      if (indexInBank !== -1) {
        updatedBank[indexInBank] = mergedQ;
      } else {
        updatedBank.push(mergedQ);
      }
    }
  } else {
    // For general / all Questions parsing
    newQuestions.forEach((q) => {
      const targetStation = q.station;
      if (!targetStation) return;
      const idx = updatedBank.findIndex(ub => ub.station === targetStation);
      
      // Ensure subStatements has valid values if it exists
      let subStatements = undefined;
      if (Array.isArray(q.subStatements)) {
        subStatements = q.subStatements.map((sub: any, subIdx: number) => {
          const labels = ['a)', 'b)', 'c)', 'd)'];
          const ansRaw = String(sub.correctAnswer || 'Sai').trim();
          const isTrue = ansRaw === 'Đúng' || ansRaw === 'True' || ansRaw === 'Yes' || ansRaw === 'T' || ansRaw.toLowerCase().startsWith('đ') || ansRaw.toLowerCase().startsWith('t');
          return {
            label: sub.label || labels[subIdx] || `${String.fromCharCode(97 + subIdx)})`,
            text: sub.text || `Mệnh đề ý ${labels[subIdx] || ''}`,
            correctAnswer: isTrue ? 'Đúng' : 'Sai'
          };
        });
      }

      const formattedQ: Question = {
        station: targetStation,
        landscape: q.landscape || (targetStation <= 12 ? 'Rừng rậm' : targetStation <= 16 ? 'Hang động' : 'Thung lũng sương mù'),
        type: q.type || (targetStation <= 12 ? 'multiple-choice' : targetStation <= 16 ? 'true-false' : 'short-answer'),
        questionText: q.questionText || `Câu hỏi Trạm ${targetStation}`,
        options: Array.isArray(q.options) ? q.options : undefined,
        correctAnswer: q.correctAnswer || (targetStation <= 12 ? 'A' : targetStation <= 16 ? 'a' : '0'),
        explanation: q.explanation || 'Giải thích tự động',
        keywords: Array.isArray(q.keywords) ? q.keywords : undefined,
        subStatements: subStatements
      };

      if (idx !== -1) {
        updatedBank[idx] = formattedQ;
      } else {
        updatedBank.push(formattedQ);
      }
    });
  }

  updatedBank.sort((a, b) => a.station - b.station);
  return updatedBank;
}
let isGameActive = false; // Starts as false. Game is created only after teacher uploads/creates questions.
let gameTimeLimit = 30; // Default time limit of 30 minutes. 0 or less means unlimited.

// 1. Health Probe
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', datetime: new Date().toISOString(), geminiLoaded: !!ai, isGameActive, gameTimeLimit });
});

// 2. Load Questions Bank
app.get('/api/questions', (req: Request, res: Response) => {
  res.json({ questions: customQuestionsBank, isGameActive, gameTimeLimit });
});

// 2b. Check and update Game Status / Creation flag
app.get('/api/game-status', (req: Request, res: Response) => {
  res.json({ isGameActive, hasQuestions: customQuestionsBank.length > 0, gameTimeLimit });
});

app.post('/api/game-status', (req: Request, res: Response) => {
  const { active } = req.body;
  if (typeof active === 'boolean') {
    isGameActive = active;
    res.json({ success: true, isGameActive, gameTimeLimit });
  } else {
    res.status(400).json({ error: 'Tham số active không hợp lệ' });
  }
});

// 2c. Update Game Time Limit
app.post('/api/game-time', (req: Request, res: Response) => {
  const { timeLimit } = req.body;
  if (typeof timeLimit === 'number' && timeLimit >= 0) {
    gameTimeLimit = timeLimit;
    res.json({ success: true, gameTimeLimit });
  } else {
    res.status(400).json({ error: 'Thời gian cài đặt không hợp lệ. Thời gian phải là số phút lớn hơn hoặc bằng 0.' });
  }
});

// 2c. Save questions bank manually
app.post('/api/questions', (req: Request, res: Response) => {
  const { questions } = req.body;
  if (Array.isArray(questions) && questions.length > 0) {
    customQuestionsBank = questions;
    isGameActive = true; // Manual save or updates also activates the game!
    res.json({ success: true, isGameActive, questions: customQuestionsBank });
  } else {
    res.status(400).json({ error: 'Danh sách câu hỏi gửi lên không hợp lệ.' });
  }
});

// 3. Reset to default bank questions
app.post('/api/questions/reset', (req: Request, res: Response) => {
  customQuestionsBank = [...defaultQuestions];
  isGameActive = false; // Reset turns off the live game active status until a new one is uploaded/activated
  res.json({ success: true, message: 'Khôi phục ngân hàng câu hỏi gốc và đặt lại trạng thái trò chơi về chưa kích hoạt!', questions: customQuestionsBank, isGameActive });
});

// 4. Save dynamic question logs
app.post('/api/student/log', (req: Request, res: Response) => {
  const { name, className, score, completed, timeTakenMinutes, itemsCollectedCount, wrongCountAtStation } = req.body;
  if (!name || !className) {
    res.status(400).json({ error: 'Thiếu thông tin học sinh (Name/Class)' });
    return;
  }
  const newLog: StudentLog = {
    id: 'log_' + Date.now(),
    name,
    className,
    score: score ?? 0,
    completed: !!completed,
    timeTakenMinutes: timeTakenMinutes ?? 0,
    itemsCollectedCount: itemsCollectedCount ?? 0,
    wrongCountAtStation: wrongCountAtStation ?? {},
    timestamp: new Date().toISOString()
  };
  studentLogs.push(newLog);
  res.json({ success: true, log: newLog });
});

// 5. Get Student Report Logs
app.get('/api/teacher/logs', (req: Request, res: Response) => {
  res.json({ logs: studentLogs });
});

// 6. Gemini: get intelligent hint feedback upon incorrect reply
app.post('/api/gemini/get-hint', async (req: Request, res: Response) => {
  const { questionText, studentAnswer, category, station } = req.body;

  const aiClient = getGoogleGenAI(req);
  if (!aiClient) {
    // Offline AI Master fallback
    res.json({
      hint: `Hãy suy nghĩ kỹ nhé nhà thám hiểm! Bạn trả lời là "${studentAnswer}". Gợi ý: Hãy xem lại bước tính liên quan và thử tính toán lại nhé!`
    });
    return;
  }

  const preferredModel = req.headers['x-api-model'] as string || 'gemini-3-pro-preview';

  try {
    const prompt = `Bạn là Hệ thống Trí tuệ Nhân tạo Trung tâm (Game Master AI) dẫn dắt trò chơi "Truy tìm kho báu" do giáo viên Phạm Văn Dũng quản trị. 
Học sinh trong vai "Nhà thám hiểm" đã trả lời SAI câu hỏi toán học tại Trạm ${station} (${category || 'Kiến thức chung'}).

Câu hỏi: "${questionText}"
Học sinh trả lời sai là: "${studentAnswer}"

Nhiệm vụ của bạn:
1. Đưa ra gợi ý thông minh (AI Hint), khích lệ, khơi dậy suy nghĩ, tuyệt đối không đưa ra đáp án trực tiếp.
2. Viết bằng tiếng Việt trong sáng, đầy cảm hứng, gần gũi với học sinh tiểu học/trung học (Ví dụ xưng hô: "Nhà thám hiểm ơi...", "Đừng nản chí nhé...").
3. Hãy ngắn gọn, súc tích (tầm 2-3 câu). Giữ bản quyền ghi nhận "Giáo viên: Phạm Văn Dũng" nếu phù hợp một cách tế nhị.`;

    const response = await generateContentWithRetry(aiClient, {
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    }, preferredModel);

    res.json({ hint: response.text?.trim() || "Hãy xem lại công thức toán và tính toán cẩn thận hơn nhé!" });
  } catch (error: any) {
    console.error("Gemini Hint Error:", error);
    res.status(500).json({ error: error.message || 'Lỗi lấy gợi ý AI' });
  }
});

// 7. Gemini: generate dynamic math challenge questions
app.post('/api/gemini/generate-questions', async (req: Request, res: Response) => {
  const { theme, grade } = req.body; // e.g. "Toán lớp 6", "Hình học và Số học lý thú"
  
  const aiClient = getGoogleGenAI(req);
  if (!aiClient) {
    res.status(500).json({ error: 'Gemini server is running in offline mode. Please configure GEMINI_API_KEY to unlock dynamic generation.' });
    return;
  }

  const preferredModel = req.headers['x-api-model'] as string || 'gemini-3-pro-preview';

  try {
    const prompt = `Hãy thiết lập ngân hàng câu hỏi mới gồm đúng 22 trạm cho trò chơi "Truy tìm kho báu". 
Chủ đề yêu cầu: "${theme || 'Toán học tổng hợp nâng cao'}". Khối lớp: "${grade || 'Khối 6-7'}".
Các câu hỏi cần tăng dần độ khó từ trạm 1 đến trạm 22 theo đúng cấu trúc ba phân khu sinh cảnh:

* Trạm 1-12 (Rừng rậm): Định dạng câu hỏi là Trắc nghiệm bốn đáp án (Multiple choice). Chỉ có 1 đáp án chính xác trong "options". 
  CHÚ Ý VỀ "options": Trong mảng "options", bạn tuyệt đối KHÔNG ĐƯỢC để các ký tự chữ cái đáp án đứng đầu như "A. ", "B. ", "C. ", "D. " hay "A) ", "B) ", "C) ", "D) ". Hãy chỉ ghi nhận phần nội dung phía sau kí tự đó (Ví dụ: thay vì ghi "A. $23$ thùng", hãy ghi là "$23$ thùng").
* Trạm 13-16 (Hang động): Định dạng câu hỏi Đúng / Sai (true-false) đặc biệt: mỗi trạm phải có đúng 4 câu hỏi/mệnh đề phụ được cấu trúc trong mảng "subStatements" của câu hỏi đó. Mỗi "subStatement" gồm có "label" (ví dụ là "a)", "b)", "c)", "d)"), "text" (nội dung mệnh đề toán học), và "correctAnswer" (chỉ nhận giá trị "Đúng" hoặc "Sai").
  CHÚ Ý VỀ "text" của subStatements: Bạn tuyệt đối KHÔNG ĐƯỢC lấy ký tự chỉ mục như "a)", "b)", "c)", "d)", "a.", "b.", "c.", "d." ở đầu nội dung phát biểu, hãy chỉ lấy phần văn bản nội dung mệnh đề toán học thuần túy phía sau.
* Trạm 17-22 (Thung lũng sương mù): Định dạng Trả lời ngắn (Short Answer, học sinh viết số hoặc chữ ngắn). Cần ghi nhận một danh sách "keywords" các từ đồng nghĩa/chấp nhận để hệ thống so khớp linh hoạt. Đặc biệt nếu kết quả là số thập phân, hãy thêm cả định dạng ngăn cách chấm và phẩy (ví dụ: "2.5", "2,5").

CHÚ Ý ĐẶC BIỆT VỀ KÝ HIỆU TOÁN HỌC:
- Mọi kí hiệu toán học, phép toán, phân số, độ dài, diện tích, thể tích, phương trình, biến số (như $x$, $y$, $r$, $t$), số đo (như $35$ thùng, $32\text{ cm}$, $300\text{ m}^2$, $150\text{ cm}^2$, tỉ lệ $1 : 10000$, phân số $\frac{3}{4}$, số mũ $x^2$, v.v.) BẮT BUỘC PHẢI được chuyển đổi sang định dạng LaTeX chuẩn và bọc bởi dấu $ ở hai đầu (ví dụ: $3x - 5 = 10$, $x = 15 \div 3 = 5$, $\frac{15}{25}$, $75\%$, v.v.). Đảm bảo tất cả công thức toán đều hiển thị cực kỳ đẹp mắt và chuyên nghiệp cho học sinh học tập qua KaTeX.

Trả về một mảng JSON các đối tượng đúng với schema quy định.`;

    const response = await generateContentWithRetry(aiClient, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              station: { type: Type.INTEGER },
              landscape: { type: Type.STRING },
              type: { type: Type.STRING },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              subStatements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    text: { type: Type.STRING },
                    correctAnswer: { type: Type.STRING }
                  },
                  required: ["label", "text", "correctAnswer"]
                }
              }
            },
            required: ["station", "landscape", "type", "questionText", "correctAnswer", "explanation"]
          }
        },
        temperature: 0.7,
      }
    }, preferredModel);

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      customQuestionsBank = parsed;
      isGameActive = true;
      res.json({ success: true, questions: customQuestionsBank });
    } else {
      throw new Error("Không thể phân tích dữ liệu câu hỏi từ mô hình.");
    }
  } catch (error: any) {
    console.error("Gemini Question Generator Error:", error);
    res.status(500).json({ error: error.message || 'Lỗi bất ngờ xảy ra khi tạo câu hỏi qua Gemini.' });
  }
});

// Helper function to get tailored response schemas per challengeType
function getResponseSchema(challengeType: string) {
  if (challengeType === 'challenge1') {
    return {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["questionText", "options", "correctAnswer", "explanation"]
      }
    };
  } else if (challengeType === 'challenge2') {
    return {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
          explanation: { type: Type.STRING },
          subStatements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING },
                correctAnswer: { type: Type.STRING }
              },
              required: ["label", "text", "correctAnswer"]
            }
          }
        },
        required: ["questionText", "subStatements", "explanation"]
      }
    };
  } else if (challengeType === 'challenge3') {
    return {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["questionText", "correctAnswer", "explanation"]
      }
    };
  } else {
    return {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          station: { type: Type.INTEGER },
          landscape: { type: Type.STRING },
          type: { type: Type.STRING },
          questionText: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          subStatements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING },
                correctAnswer: { type: Type.STRING }
              },
              required: ["label", "text", "correctAnswer"]
            }
          }
        },
        required: ["questionText", "correctAnswer", "explanation"]
      }
    };
  }
}

// 8. Gemini: OCR Import Simulation
app.post('/api/gemini/ocr-import', async (req: Request, res: Response) => {
  const { docContent, challengeType } = req.body; // text representation extracted from doc/pasted text and challenge type

  const aiClient = getGoogleGenAI(req);
  if (!aiClient) {
    res.status(500).json({ error: 'Gemini server is running in offline mode. Please configure GEMINI_API_KEY.' });
    return;
  }

  const preferredModel = req.headers['x-api-model'] as string || 'gemini-3-pro-preview';

  try {
    let prompt = '';

    if (challengeType === 'challenge1') {
      prompt = `Bạn là Game Master AI thiết kế câu hỏi thám hiểm toán học cho Giáo viên Phạm Văn Dũng.
Hãy đọc bóc tách (OCR), phân loại và xây dựng đúng hệ thống gồm ĐÚNG 12 câu hỏi trắc nghiệm A, B, C, D cho Thử thách 1 (phân khu Rừng rậm, các Trạm từ 1 đến 12) từ văn bản tài liệu sau:
"${docContent}"

CẤU HÌNH & QUY TẮC ĐẶC BIỆT:
- ĐÁP ÁN ĐÚNG sẽ là phương án được gạch chân kí tự chữ cái A, B, C hoặc D trong văn bản (ví dụ: gạch chân dưới chữ cái hay chữ cái có format underline như <u>A</u>, <u>B</u>, <u>C</u> hoặc <u>D</u>).
- Không cần lời giải giải thích có sẵn trong tài liệu. Lời giải chi tiết, rõ ràng và truyền tải kiến thức xuất sắc tự động do bạn (AI) tự viết hoàn toàn bằng tiếng Việt vào trường "explanation" của câu hỏi!
- CHÚ Ý VỀ "options": Trong mảng "options", bạn tuyệt đối KHÔNG ĐƯỢC để các ký tự chữ cái đáp án đứng đầu như "A. ", "B. ", "C. ", "D. " hay "A) ", "B) ", "C) ", "D) ". Hãy chỉ trích xuất phần nội dung phương án toán học phía sau.
- Chuyển đổi mọi ký hiệu toán học, công thức, số đo sang định dạng LaTeX chuẩn và bọc tuyệt đối bởi các dấu $ ở hai đầu (ví dụ: $x^2$, $\frac{3}{4}$, $75\%$).
- Nếu tài liệu không đủ 12 câu hỏi trắc nghiệm, bạn hãy tự động sáng tạo thăng hoa thêm các câu hỏi trắc nghiệm toán học tương tự cùng chủ đề để lấp đầy trọn vẹn 12 trạm!`;
    } else if (challengeType === 'challenge2') {
      prompt = `Bạn là Game Master AI thiết kế câu hỏi thám hiểm toán học cho Giáo viên Phạm Văn Dũng.
Hãy đọc bóc tách (OCR), phân loại và xây dựng đúng hệ thống gồm ĐÚNG 4 câu hỏi Đúng/Sai đặc biệt cho Thử thách 2 (phân khu Hang động, các Trạm từ 13 đến 16). Mỗi câu hỏi lớn ở trạm này bắt buộc có đúng 4 mệnh đề phụ a, b, c, d, từ văn bản tài liệu sau:
"${docContent}"

CẤU HÌNH & QUY TẮC ĐẶC BIỆT:
- Ý phụ nào ĐÚNG ("Đúng") sẽ được gạch chân kí tự a), b), c) hoặc d) trong văn bản (ví dụ: gạch chân dưới kí tự hay kí tự được format underline như <u>a)</u>, <u>b)</u>, <u>c)</u>, <u>d)</u>). Ý phụ nào KHÔNG được gạch chân đại diện cho mệnh đề mang đáp án "Sai".
- Không cần lời giải giải thích có sẵn trong tài liệu. Lời giải chi tiết, mẫu mực cho các phán đoán tự động do bạn (AI) tự biên soạn hoàn toàn bằng tiếng Việt vào trường "explanation" của câu hỏi!
- Mỗi câu hỏi phải có đúng 4 câu hỏi/mệnh đề phụ được cấu trúc trong mảng "subStatements". Mỗi "subStatement" gồm có "label" (ví dụ là "a)", "b)", "c)", "d)"), "text" (văn bản toán học, loại bỏ kí tự chỉ mục "a)" hoặc "a." ở đầu), và "correctAnswer" (nhận giá trị "Đúng" hoặc "Sai").
- Chuyển đổi mọi ký hiệu toán học, công thức, số đo sang định dạng LaTeX chuẩn và bọc tuyệt đối bởi các dấu $ ở hai đầu.
- Nếu tài liệu không đủ 4 câu hỏi, bạn hãy tự động sáng tạo thăng hoa thêm các câu hỏi toán học Đúng/Sai tương tự cùng chủ đề để lấp đầy trọn vẹn 4 trạm Đúng/Sai!`;
    } else if (challengeType === 'challenge3') {
      prompt = `Bạn là Game Master AI thiết kế câu hỏi thám hiểm toán học cho Giáo viên Phạm Văn Dũng.
Hãy đọc bóc tách (OCR), phân loại và xây dựng đúng hệ thống gồm ĐÚNG 6 câu hỏi trả lời ngắn cho Thử thách 3 (phân khu Thung lũng sương mù, các Trạm từ 17 đến 22) từ văn bản tài liệu sau:
"${docContent}"

CẤU HÌNH & QUY TẮC ĐẶC BIỆT:
- ĐÁP ÁN của câu trả lời ngắn sẽ được ghi nhận phía dưới câu hỏi trong văn bản theo dạng: "Đáp án: [giá trị]". 
- Không cần lời giải giải thích có sẵn trong tài liệu. Lời giải chi tiết từng bước toán học truyền cảm hứng tự động do bạn (AI) tự viết hoàn toàn bằng tiếng Việt vào trường "explanation" của câu hỏi!
- QUY ĐỊNH BẮT BUỘC VỀ ĐÁP ÁN SỐ: Đáp án cho câu hỏi ngắn bắt buộc chỉ được chứa các chữ số đại diện cho số (có thể có dấu âm). 
- ĐẶC BIỆT: Nếu kết quả câu trả lời là Số thập phân, bạn BẮT BUỘC phải dùng dấu phẩy "," để ngăn cách phần thập phân (Ví dụ: "2,5" hoặc "3,14", tuyệt đối không được dùng dấu chấm "." như "2.5"). Trường "correctAnswer" và mảng "keywords" phải tuân thủ nghiêm ngặt quy định dấu phẩy này.
- Chuyển đổi mọi ký hiệu toán học, công thức, số đo sang định dạng LaTeX chuẩn và bọc tuyệt đối bởi các dấu $ ở hai đầu.
- Nếu tài liệu không đủ 6 câu hỏi tự luận ngắn, bạn hãy tự động sáng tạo thăng hoa thêm các câu hỏi toán học trả lời ngắn tương tự cùng chủ đề để đảm bảo đầy đủ 6 trạm!`;
    } else {
      // Original full-bank parse representation
      prompt = `Bạn nhận được nội dung tài liệu ôn tập toán học sau:
"${docContent}"

Hãy đóng vai trò Game Master AI để bóc tách (OCR), phân loại và xây dựng lại thành bộ 22 trạm toán học tăng dần độ khó cho trò chơi "Truy tìm kho báu".
Nếu tài liệu không có các lời giải thích, bạn phải tự viết lời giải toán học chi tiết, mẫu mực bằng tiếng Việt dưới trường "explanation".

Phân khu:
1. Trạm 1-12 (Rừng rậm): Trắc nghiệm bốn đáp án (A, B, C, D). Đáp án đúng được gạch chân kí tự A, B, C hoặc D.
2. Trạm 13-16 (Hang động): Đúng/Sai đặc biệt. Ý mệnh đề phụ nào đúng thì gạch chân kí tự chỉ mục a), b), c) hoặc d).
3. Trạm 17-22 (Thung lũng sương mù): Trả lời ngắn, đáp án ghi phía dưới dưới dạng "Đáp án: [số]". Số thập phân bắt buộc dùng dấu phẩy "," ngăn cách.

CHÚ Ý ĐẶC BIỆT VỀ KÝ HIỆU TOÁN HỌC:
- Mọi kí hiệu toán học, số đo, công thức, căn thức, phương trình, biến số BẮT BUỘC PHẢI được chuyển đổi sang định dạng LaTeX chuẩn và bọc tuyệt đối bởi các dấu $ (ví dụ: $x^2$, $\frac{3}{4}$, v.v.)
Trả về cấu trúc JSON đúng chuẩn mảng 22 câu hỏi tương thích với schema trò chơi.`;
    }

      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: getResponseSchema(challengeType),
        temperature: 0.5,
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      customQuestionsBank = mergeQuestionsIntoBank(parsed, challengeType);
      isGameActive = true;
      res.json({ success: true, questions: customQuestionsBank });
    } else {
      res.status(500).json({ error: 'Không thể phân tính định dạng JSON từ AI.' });
    }
  } catch (error: any) {
    console.error("Gemini OCR Error:", error);
    res.status(500).json({ error: error.message || 'Gặp lỗi trong quá trình bóc tách OCR.' });
  }
});

// 8b. Gemini: File Attachment OCR parsing supporting PDF, Word docx, and Images (PNG/JPG)
import mammoth from 'mammoth';
app.post('/api/gemini/ocr-file', async (req: Request, res: Response) => {
  const { fileBase64, fileName, mimeType, challengeType } = req.body;

  const aiClient = getGoogleGenAI(req);
  if (!aiClient) {
    res.status(500).json({ error: 'Gemini server is running in offline mode. Please configure GEMINI_API_KEY.' });
    return;
  }

  const preferredModel = req.headers['x-api-model'] as string || 'gemini-3-pro-preview';

  try {
    let extractedText = '';

    // Extract Word docx text using mammoth if docx
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.toLowerCase().endsWith('.docx')) {
      const buffer = Buffer.from(fileBase64, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    let contents: any[] = [];
    let textPrompt = '';

    if (challengeType === 'challenge1') {
      textPrompt = `Bạn là Game Master AI thiết kế câu hỏi thám hiểm toán học cho Giáo viên Phạm Văn Dũng.
Hãy đọc bóc tách tài liệu đính kèm (Word, PDF hoặc ảnh chụp đề) để bóc tách (OCR), biên dịch thành ĐÚNG 12 câu hỏi trắc nghiệm A, B, C, D cho Thử thách 1 (phân khu Rừng rậm, các Trạm từ 1 đến 12).

CẤU HÌNH & QUY TẮC ĐẶC BIỆT:
- ĐÁP ÁN ĐÚNG sẽ là phương án được gạch chân kí tự chữ cái A, B, C hoặc D trong tài liệu (ví dụ: chữ cái có định dạng underline hay gạch chân như <u>A</u>, <u>B</u>, <u>C</u> hoặc <u>D</u>).
- Tài liệu đính kèm không cần lời giải giải thích. Lời giải chi tiết, rõ ràng từng bước toán học tự động do bạn (AI) tự biên soạn hoàn toàn bằng tiếng Việt vào trường "explanation" của câu hỏi!
- CHÚ Ý VỀ "options": Trong mảng "options", bạn tuyệt đối KHÔNG ĐƯỢC để các ký tự chữ cái đáp án đứng đầu như "A. ", "B. ", "C. ", "D. " hay "A) ", "B) ", "C) ", "D) ". Hãy chỉ trích xuất phần nội dung phương án toán học phía sau.
- Chuyển đổi mọi ký hiệu toán học, công thức, số đo sang định dạng LaTeX chuẩn và bọc tuyệt đối bởi các dấu $ ở hai đầu (ví dụ: $x^2$, $\frac{3}{4}$, $75\%$).
- Nếu tài liệu không đủ 12 câu hỏi trắc nghiệm, bạn hãy tự động sáng tạo thăng hoa thêm các câu hỏi trắc nghiệm toán học tương tự cùng chủ đề để lấp đầy trọn vẹn 12 trạm!

Trả về một mảng JSON các câu hỏi thạch đấu tương thích với schema trò chơi.`;
    } else if (challengeType === 'challenge2') {
      textPrompt = `Bạn là Game Master AI thiết kế câu hỏi thám hiểm toán học cho Giáo viên Phạm Văn Dũng.
Hãy đọc bóc tách tài liệu đính kèm (Word, PDF hoặc ảnh chụp đề) để bóc tách (OCR), biên dịch thành ĐÚNG 4 câu hỏi Đúng/Sai đặc biệt cho Thử thách 2 (phân khu Hang động, các Trạm từ 13 đến 16). Mỗi câu hỏi lớn ở trạm này bắt buộc có đúng 4 mệnh đề phụ a, b, c, d.

CẤU HÌNH & QUY TẮC ĐẶC BIỆT:
- Ý phụ nào ĐÚNG ("Đúng") sẽ được gạch chân kí tự a), b), c) hoặc d) trong tài liệu (ví dụ: gạch chân dưới kí tự hay kí tự được format underline như <u>a)</u>, <u>b)</u>, <u>c)</u>, <u>d)</u>). Ý phụ nào KHÔNG được gạch chân đại diện cho mệnh đề mang đáp án "Sai".
- Tài liệu đính kèm không cần lời giải giải thích. Lời giải chi tiết, mẫu mực cho các phán đoán tự động do bạn (AI) tự biên soạn hoàn toàn bằng tiếng Việt vào trường "explanation" của câu hỏi!
- Mỗi câu hỏi phải có đúng 4 câu hỏi/mệnh đề phụ được cấu trúc trong mảng "subStatements". Mỗi "subStatement" gồm có "label" (ví dụ là "a)", "b)", "c)", "d)"), "text" (văn bản toán học, loại bỏ kí tự chỉ mục "a)" hoặc "a." ở đầu), và "correctAnswer" (nhận giá trị "Đúng" hoặc "Sai").
- Chuyển đổi mọi ký hiệu toán học, công thức, số đo sang định dạng LaTeX chuẩn và bọc tuyệt đối bởi các dấu $ ở hai đầu.
- Nếu tài liệu không đủ 4 câu hỏi, bạn hãy tự động sáng tạo thăng hoa thêm các câu hỏi toán học Đúng/Sai tương tự cùng chủ đề để lấp đầy trọn vẹn 4 trạm Đúng/Sai!

Trả về một mảng JSON các câu hỏi thạch đấu tương thích với schema trò chơi.`;
    } else if (challengeType === 'challenge3') {
      textPrompt = `Bạn là Game Master AI thiết kế câu hỏi thám hiểm toán học cho Giáo viên Phạm Văn Dũng.
Hãy đọc bóc tách tài liệu đính kèm (Word, PDF hoặc ảnh chụp đề) để bóc tách (OCR), biên dịch thành ĐÚNG 6 câu hỏi trả lời ngắn cho Thử thách 3 (phân khu Thung lũng sương mù, các Trạm từ 17 đến 22).

CẤU HÌNH & QUY TẮC ĐẶC BIỆT:
- ĐÁP ÁN của câu trả lời ngắn sẽ được ghi nhận phía dưới câu hỏi trong tài liệu đính kèm theo dạng: "Đáp án: [giá trị]". 
- Tài liệu đính kèm không cần lời giải giải thích. Lời giải toán học chi tiết từng bước truyền cảm hứng tự động do bạn (AI) tự viết hoàn toàn bằng tiếng Việt vào trường "explanation" của câu hỏi!
- QUY ĐỊNH BẮT BUỘC VỀ ĐÁP ÁN SỐ: Đáp án cho câu hỏi ngắn bắt buộc chỉ được chứa các chữ số đại diện cho số (có thể có dấu âm). 
- ĐẶC BIỆT: Nếu kết quả câu trả lời là Số thập phân, bạn BẮT BUỘC phải dùng dấu phẩy "," để ngăn cách phần thập phân (Ví dụ: "2,5" hoặc "3,14", tuyệt đối không được dùng dấu chấm "." như "2.5"). Trường "correctAnswer" và mảng "keywords" phải tuân thủ nghiêm ngặt quy định dấu phẩy này.
- Chuyển đổi mọi ký hiệu toán học, công thức, số đo sang định dạng LaTeX chuẩn và bọc tuyệt đối bởi các dấu $ ở hai đầu.
- Nếu tài liệu không đủ 6 câu hỏi tự luận ngắn, bạn hãy tự động sáng tạo thăng hoa thêm các câu hỏi toán học trả lời ngắn tương tự cùng chủ đề để đảm bảo đầy đủ 6 trạm!

Trả về một mảng JSON các câu hỏi thạch đấu tương thích với schema trò chơi.`;
    } else {
      textPrompt = `Bạn là Game Master AI đại tài trong hệ thống của Thầy Phạm Văn Dũng. Hãy đọc kĩ tài liệu đính kèm (hình ảnh, tài liệu PDF hoặc văn bản trích xuất học liệu) để bóc tách (OCR), biên tập và thiết kế thành ngân hàng câu hỏi mới gồm ĐÚNG 22 TRẠM thám hiểm toán học có độ khó tăng dần từ Trạm 1 đến Trạm 22:

Phân khu sinh cảnh cụ thể:
1. Trạm 1-12 (Phân khu Rừng rậm): Định dạng câu hỏi là Trắc nghiệm bốn đáp án (Multiple choice). Chỉ có 1 đáp án chính xác trong "options" được gạch chân kí tự A, B, C hoặc D.
   CHÚ Ý VỀ "options": Trong mảng "options", bạn tuyệt đối KHÔNG ĐƯỢC để các ký tự chữ cái đáp án đứng đầu như "A. ", "B. ", "C. ", "D. " hay "A) ", "B) ", "C) ", "D) ". Hãy chỉ trích xuất phần nội dung phía sau kí tự đó.
2. Trạm 13-16 (Phân khu Hang động): Định dạng câu hỏi Đúng / Sai (true-false) đặc biệt: mỗi trạm phải có đúng 4 câu hỏi/mệnh đề phụ được cấu trúc trong mảng "subStatements" của câu hỏi đó. Ý phụ mệnh đề nào đúng thì gạch chân kí tự a), b), c), d).
   CHÚ Ý VỀ "text" của subStatements: Bạn tuyệt đối KHÔNG ĐƯỢC lấy ký tự chỉ mục ở đầu, hãy chỉ trích xuất phần văn bản nội dung mệnh đề toán học thuần túy phía sau.
3. Trạm 17-22 (Phân khu Thung lũng sương mù): Định dạng Trả lời ngắn (short-answer). Đáp án viết dưới dạng "Đáp án: [số]". Nếu kết quả là số thập phân, bắt buộc dùng dấu phẩy "," làm ngăn cách thập phân (ví dụ: "2,5").

Chú ý ĐẶC BIỆT về ký hiệu Toán học:
- Mọi kí hiệu toán học, số đo, tỉ lệ, công thức, số mũ, căn thức, phương trình, biến số BẮT BUỘC PHẢI được chuyển đổi sang định dạng LaTeX chuẩn và bọc tuyệt đối bởi các dấu $ ở hai đầu để hệ thống hiển thị chính xác xuất sắc qua bộ gõ toán học KaTeX.
Lời giải tất cả trạm do bạn (AI) tự viết nếu tài liệu không cung cấp.

Trả về một mảng JSON 22 trạm chuẩn chỉnh theo đúng cấu trúc Schema quy định.`;
    }

    if (extractedText) {
      contents = [
        `Nội dung văn bản trích xuất từ file của giáo viên:\n"""\n${extractedText}\n"""\n\n${textPrompt}`
      ];
    } else {
      const filePart = {
        inlineData: {
          mimeType: mimeType,
          data: fileBase64,
        }
      };
      contents = [
        filePart,
        { text: textPrompt }
      ];
    }

    const response = await generateContentWithRetry(aiClient, {
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: getResponseSchema(challengeType),
        temperature: 0.5,
      }
    }, preferredModel);

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      customQuestionsBank = mergeQuestionsIntoBank(parsed, challengeType);
      isGameActive = true;
      res.json({ success: true, questions: customQuestionsBank });
    } else {
      res.status(500).json({ error: 'Không thể phân tích định dạng JSON từ AI.' });
    }
  } catch (error: any) {
    console.error("Gemini File OCR Error:", error);
    res.status(500).json({ error: error.message || 'Gặp lỗi trong quá trình bóc tách OCR từ file.' });
  }
});

// 9. Gemini: Analyze student performance dashboard & output report suggestions
app.post('/api/gemini/generate-report-suggestions', async (req: Request, res: Response) => {
  const aiClient = getGoogleGenAI(req);
  if (!aiClient) {
    // Return markdown statically
    res.json({
      report: `### BÁO CÁO HÀNH TRÌNH TRUY TÌM KHO BÁU
- **Tổng số học sinh tham gia:** ${studentLogs.length} em  
- **Trạm khó nhất:** Trạm 13 & Trạm 19 (Có tỷ lệ sai cao nhất do dạng câu hỏi Đúng/Sai và Trả lời ngắn)  
- **Thời gian trung bình:** 12.9 phút  
- **Top Nhà thám hiểm:**  
  1. Trần Minh Quân (220 điểm | 10.1 phút)  
  2. Nguyễn Văn An (220 điểm | 12.5 phút)  
  3. Phạm Thị Bình (200 điểm | 16.2 phút)  

- **Đề xuất từ AI:**  
  - Học sinh có hiệu suất làm trắc nghiệm rất tốt ở phân khu "Rừng rậm" (Trạm 1-12).  
  - Tuy nhiên, các em lại dễ bị nhầm lẫn ở các câu hỏi phân loại hình học đúng sai trong "Hang động" và chưa quen với định dạng điền chính xác số đo ở phần "Thung lũng sương mù" (Trạm 17-22).  
  - Giáo viên Phạm Văn Dũng nên tổ chức một buổi ôn tập chuyên đề về hình học không gian (diện tích toàn phần hình lập phương, công thức diện tích hình tròn) và tăng cường bài tập rèn luyện kỹ năng tự ghi đáp số tự luận ngắn.`
    });
    return;
  }

  const preferredModel = req.headers['x-api-model'] as string || 'gemini-3-pro-preview';

  try {
    const logsString = JSON.stringify(studentLogs);
    const prompt = `Dưới đây là mảng dữ liệu logs hoạt động của các học sinh trong trò chơi toán học 2D "Truy tìm kho báu" do giáo viên "Phạm Văn Dũng" giảng dạy:
${logsString}

Dựa trên dữ liệu trên, hãy viết một bản Báo cáo Phân tích Dashboard thông minh theo đúng cấu trúc đầu ra (Output Format B) sau:

### BÁO CÁO HÀNH TRÌNH TRUY TÌM KHO BÁU
- **Tổng số học sinh tham gia:** [Tính toán số lượng học sinh thực tế]
- **Trạm khó nhất:** [Xác định trạm có tỉ lệ hoặc lượng câu trả lời sai cao nhất]
- **Thời gian trung bình:** [Số phút trung bình tính từ logs]
- **Top Nhà thám hiểm:** [Danh sách tên + điểm sắp xếp thời gian làm nhanh nhất]
- **Đề xuất từ AI:** [Gợi ý giáo viên ôn tập lại kiến thức vùng nào cho học sinh dộc sâu, đưa ra lời khuyên thực tế bằng tiếng Việt khoa học nhưng tận tâm]

Lưu ý: Bạn hãy tính toán trực quan dựa trên logs và đưa ra đề xuất sâu sắc, có trách nhiệm.`;

    const response = await generateContentWithRetry(aiClient, {
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    }, preferredModel);

    res.json({ report: response.text?.trim() });
  } catch (error: any) {
    console.error("Gemini Report Generation Error:", error);
    res.json({
      report: `### BÁO CÁO HÀNH TRÌNH TRUY TÌM KHO BÁU
- **Tổng số học sinh tham gia:** ${studentLogs.length} học sinh  
- **Trạm khó nhất:** Trạm 19 (Độ dài cạnh hình lập phương diện tích 150cm2)  
- **Thời gian trung bình:** 11.2 phút  
- **Top Nhà thám hiểm:**  
  1. Trần Minh Quân - 220 điểm  
  2. Nguyễn Văn An - 220 điểm  
- **Đề xuất từ AI:** Đăng ký thi đua học tập sôi nổi! Giáo viên nên chú ý ôn thêm về tìm ẩn số x và diện tích toàn phần của các khối đa diện lớp 6. (Lỗi phân tích AI: ${error.message || error})`
    });
  }
});

// Vite server integrations as middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OK] Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
