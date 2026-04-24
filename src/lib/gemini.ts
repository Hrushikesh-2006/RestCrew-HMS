const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const AI_TIMEOUT_MS = 12000;

export function isGeminiConfigured() {
  return Boolean(GEMINI_API_KEY || GROQ_API_KEY);
}

export function getAIProviderLabel() {
  if (GROQ_API_KEY) {
    return "Groq";
  }

  if (GEMINI_API_KEY) {
    return "Gemini";
  }

  return null;
}

async function fetchAI(
  prompt: string,
  maxOutputTokens: number,
  temperature: number,
) {
  if (!GROQ_API_KEY && !GEMINI_API_KEY) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    if (GROQ_API_KEY) {
      return await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          temperature,
          max_tokens: maxOutputTokens,
          messages: [{ role: "user", content: prompt }],
        }),
      });
    }

    return await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function extractResponseText(response: Response) {
  const result = await response.json();

  if (GROQ_API_KEY) {
    return result.choices?.[0]?.message?.content ?? "";
  }

  return result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  expensesByCategory: { category: string; amount: number }[];
  monthlyData: { month: string; revenue: number; expenses: number }[];
  studentCount: number;
  roomCount: number;
  occupancyRate: number;
  paidFeeAmount?: number;
  pendingFeeAmount?: number;
  overdueFeeAmount?: number;
  paidFeeCount?: number;
  pendingFeeCount?: number;
  overdueFeeCount?: number;
  collectionRate?: number;
}

export interface AIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  warnings: string[];
}

function buildFallbackAnalysis(data: FinancialData): AIAnalysis {
  return {
    summary: isGeminiConfigured()
      ? "AI analysis is temporarily unavailable. Please try again later."
      : "AI analysis is unavailable because no Gemini or Groq API key is configured.",
    insights: [
      `Current net profit is Rs. ${data.netProfit.toLocaleString()}.`,
      `Fee collection rate is ${(data.collectionRate ?? 0).toFixed(1)}%.`,
      `Pending plus overdue payments total Rs. ${((data.pendingFeeAmount ?? 0) + (data.overdueFeeAmount ?? 0)).toLocaleString()}.`,
    ],
    recommendations: [
      "Follow up with students who have pending or overdue fees.",
      "Review expense categories to identify cost-cutting opportunities.",
      "Improve room occupancy to strengthen recurring revenue.",
    ],
    warnings:
      data.netProfit < 0
        ? ["Expenses currently exceed collected revenue."]
        : (data.overdueFeeCount ?? 0) > 0
          ? [`${data.overdueFeeCount} overdue payment(s) need attention.`]
          : [],
  };
}

export async function analyzeFinancials(
  data: FinancialData,
): Promise<AIAnalysis> {
  const prompt = `
You are a financial analyst for a hostel management business. Analyze the following financial and payment data and provide insights.

Financial Summary:
- Total Revenue: Rs. ${data.totalRevenue.toLocaleString()}
- Total Expenses: Rs. ${data.totalExpenses.toLocaleString()}
- Net Profit: Rs. ${data.netProfit.toLocaleString()}
- Number of Students: ${data.studentCount}
- Number of Rooms: ${data.roomCount}
- Occupancy Rate: ${data.occupancyRate}%
- Fee Collection Rate: ${(data.collectionRate ?? 0).toFixed(1)}%

Payment Analysis:
- Paid Fees: ${data.paidFeeCount ?? 0} payment(s) worth Rs. ${(data.paidFeeAmount ?? 0).toLocaleString()}
- Pending Fees: ${data.pendingFeeCount ?? 0} payment(s) worth Rs. ${(data.pendingFeeAmount ?? 0).toLocaleString()}
- Overdue Fees: ${data.overdueFeeCount ?? 0} payment(s) worth Rs. ${(data.overdueFeeAmount ?? 0).toLocaleString()}

Expenses by Category:
${data.expensesByCategory.map((e) => `- ${e.category}: Rs. ${e.amount.toLocaleString()}`).join("\n")}

Monthly Performance:
${data.monthlyData.map((m) => `- ${m.month}: Revenue Rs. ${m.revenue.toLocaleString()}, Expenses Rs. ${m.expenses.toLocaleString()}`).join("\n")}

Return valid JSON only in this shape:
{
  "summary": "A concise 2-3 sentence summary",
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "warnings": ["Warning 1"]
}
`;

  try {
    const response = await fetchAI(prompt, 1024, 0.7);

    if (!response.ok) {
      throw new Error(`AI provider error: ${response.status}`);
    }

    const text = await extractResponseText(response);
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return buildFallbackAnalysis(data);
    }

    return JSON.parse(jsonMatch[0]) as AIAnalysis;
  } catch (error) {
    if (error instanceof Error && error.message !== "AI_NOT_CONFIGURED") {
      console.error("AI Analysis Error:", error);
    }

    return buildFallbackAnalysis(data);
  }
}

export async function getInvestmentAdvice(
  data: FinancialData,
  investmentDescription: string,
): Promise<string> {
  const prompt = `
You are a financial advisor for a hostel business.

Financial Summary:
- Revenue: Rs. ${data.totalRevenue.toLocaleString()}
- Expenses: Rs. ${data.totalExpenses.toLocaleString()}
- Net Profit: Rs. ${data.netProfit.toLocaleString()}
- Collection Rate: ${(data.collectionRate ?? 0).toFixed(1)}%

The owner is considering: "${investmentDescription}"

Give a short 3-4 sentence recommendation focused on ROI and cash-flow impact.
`;

  try {
    const response = await fetchAI(prompt, 256, 0.7);

    if (!response.ok) {
      return "Unable to analyze investment at this time. Please review cash flow before proceeding.";
    }

    const text = await extractResponseText(response);
    return text || "Analysis unavailable.";
  } catch {
    return "Investment analysis temporarily unavailable. Consider current cash flow and ROI timeline before proceeding.";
  }
}

export async function generateFinancialReport(
  data: FinancialData,
): Promise<string> {
  const prompt = `
Generate a short professional monthly report for a hostel business using this data:

- Revenue: Rs. ${data.totalRevenue.toLocaleString()}
- Expenses: Rs. ${data.totalExpenses.toLocaleString()}
- Net Profit: Rs. ${data.netProfit.toLocaleString()}
- Occupancy Rate: ${data.occupancyRate}%
- Collection Rate: ${(data.collectionRate ?? 0).toFixed(1)}%
- Students: ${data.studentCount}

Expenses by Category:
${data.expensesByCategory.map((e) => `- ${e.category}: Rs. ${e.amount.toLocaleString()}`).join("\n")}
`;

  try {
    const response = await fetchAI(prompt, 512, 0.6);

    if (!response.ok) {
      return `Monthly Report: Revenue Rs. ${data.totalRevenue.toLocaleString()}, Expenses Rs. ${data.totalExpenses.toLocaleString()}, Net Profit Rs. ${data.netProfit.toLocaleString()}.`;
    }

    const text = await extractResponseText(response);
    return text || "Report generation failed.";
  } catch {
    return `Financial Summary: Revenue Rs. ${data.totalRevenue.toLocaleString()}, Expenses Rs. ${data.totalExpenses.toLocaleString()}, Profit Rs. ${data.netProfit.toLocaleString()}.`;
  }
}
