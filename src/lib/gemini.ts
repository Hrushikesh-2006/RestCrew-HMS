const GEMINI_API_KEY = "AIzaSyCAoOOZlvRK2JefJcQNtVszZrfb_GdT1Tw";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  expensesByCategory: { category: string; amount: number }[];
  monthlyData: { month: string; revenue: number; expenses: number }[];
  studentCount: number;
  roomCount: number;
  occupancyRate: number;
}

export interface AIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  warnings: string[];
}

export async function analyzeFinancials(
  data: FinancialData,
): Promise<AIAnalysis> {
  const prompt = `
You are a financial analyst for a hostel management business. Analyze the following financial data and provide insights.

Financial Summary:
- Total Revenue: ₹${data.totalRevenue.toLocaleString()}
- Total Expenses: ₹${data.totalExpenses.toLocaleString()}
- Net Profit: ₹${data.netProfit.toLocaleString()}
- Number of Students: ${data.studentCount}
- Number of Rooms: ${data.roomCount}
- Occupancy Rate: ${data.occupancyRate}%

Expenses by Category:
${data.expensesByCategory.map((e) => `- ${e.category}: ₹${e.amount.toLocaleString()}`).join("\n")}

Monthly Performance:
${data.monthlyData.map((m) => `- ${m.month}: Revenue ₹${m.revenue.toLocaleString()}, Expenses ₹${m.expenses.toLocaleString()}`).join("\n")}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "A 2-3 sentence overall summary of the financial health",
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "warnings": ["Warning 1 if any concerns, or empty array if no warnings"]
}

Only return valid JSON, no markdown formatting.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

    // Parse JSON from response
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if parsing fails
    return {
      summary: "Unable to generate AI analysis at this time.",
      insights: ["Check your internet connection and try again."],
      recommendations: ["Ensure all financial data is up to date."],
      warnings: [],
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary:
        "AI analysis is temporarily unavailable. Please try again later.",
      insights: [
        `Your current net profit is ₹${data.netProfit.toLocaleString()}`,
        `Revenue to expense ratio: ${data.totalExpenses > 0 ? ((data.totalRevenue / data.totalExpenses) * 100).toFixed(1) : 0}%`,
        `Occupancy rate: ${data.occupancyRate}%`,
      ],
      recommendations: [
        "Review expense categories to identify cost-cutting opportunities",
        "Focus on increasing occupancy rate for better revenue",
        "Regularly update fee collection to improve cash flow",
      ],
      warnings:
        data.netProfit < 0
          ? ["Your expenses exceed revenue. Immediate attention required."]
          : [],
    };
  }
}

export async function getInvestmentAdvice(
  data: FinancialData,
  investmentDescription: string,
): Promise<string> {
  const prompt = `
You are a financial advisor for a hostel business. The business has the following financial status:

- Monthly Revenue: ₹${data.totalRevenue.toLocaleString()}
- Monthly Expenses: ₹${data.totalExpenses.toLocaleString()}
- Net Profit: ₹${data.netProfit.toLocaleString()}
- Students: ${data.studentCount}
- Rooms: ${data.roomCount}

The owner is considering an investment: "${investmentDescription}"

Provide a brief analysis (3-4 sentences) on whether this is a good investment considering the current financial status.
Focus on ROI potential and impact on the business.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      return "Unable to analyze investment at this time. Please review your financial capacity before proceeding.";
    }

    const result = await response.json();
    return (
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Analysis unavailable."
    );
  } catch (error) {
    return "Investment analysis temporarily unavailable. Consider your current cash flow and ROI timeline before proceeding.";
  }
}

export async function generateFinancialReport(
  data: FinancialData,
): Promise<string> {
  const prompt = `
Generate a professional monthly financial report for a hostel business with the following data:

Financial Summary:
- Total Revenue: ₹${data.totalRevenue.toLocaleString()}
- Total Expenses: ₹${data.totalExpenses.toLocaleString()}
- Net Profit: ₹${data.netProfit.toLocaleString()}
- Occupancy Rate: ${data.occupancyRate}%
- Students: ${data.studentCount}

Expenses Breakdown:
${data.expensesByCategory.map((e) => `- ${e.category}: ₹${e.amount.toLocaleString()}`).join("\n")}

Generate a brief professional report in 4-5 sentences highlighting key financial metrics and business health.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      return `Monthly Report: Revenue ₹${data.totalRevenue.toLocaleString()}, Expenses ₹${data.totalExpenses.toLocaleString()}, Net Profit ₹${data.netProfit.toLocaleString()}`;
    }

    const result = await response.json();
    return (
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Report generation failed."
    );
  } catch (error) {
    return `Financial Summary: Revenue ₹${data.totalRevenue.toLocaleString()}, Expenses ₹${data.totalExpenses.toLocaleString()}, Profit ₹${data.netProfit.toLocaleString()}`;
  }
}
