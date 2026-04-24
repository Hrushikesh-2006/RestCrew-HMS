export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  analyzeFinancials,
  getAIProviderLabel,
  isGeminiConfigured,
  type FinancialData,
} from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let data: FinancialData;

    try {
      data = JSON.parse(rawBody) as FinancialData;
    } catch {
      return NextResponse.json(
        { error: "Invalid financial analysis payload." },
        { status: 400 },
      );
    }

    const analysis = await analyzeFinancials(data);

    return NextResponse.json({
      analysis,
      provider: getAIProviderLabel(),
      configured: isGeminiConfigured(),
    });
  } catch (error) {
    console.error("Financial analysis route error:", error);
    return NextResponse.json(
      { error: "Unable to analyze financial data right now." },
      { status: 500 },
    );
  }
}
