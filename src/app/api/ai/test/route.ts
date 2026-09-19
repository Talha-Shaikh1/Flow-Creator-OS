import { NextRequest, NextResponse } from 'next/server';
import { callUniversalLLM, AIProviderConfig } from '@/lib/engine/llm-provider';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const config: AIProviderConfig = {
      provider: body.provider || 'gemini',
      apiKey: body.apiKey,
      model: body.model,
    };

    const response = await callUniversalLLM({
      config,
      prompt: 'Respond with a simple JSON object: {"status": "ok", "engine": "FlowCreator OS AI Engine", "test": "Connection successful"}',
      systemInstruction: 'You are an AI connection tester. Respond strictly with valid JSON.',
      temperature: 0.2,
      responseJson: true,
    });

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      provider: response.provider,
      model: response.model,
      latencyMs,
      message: `Successfully connected to ${response.provider.toUpperCase()} (${response.model}) in ${latencyMs}ms.`,
      sample: response.parsed,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        latencyMs,
        error: err.message || 'Connection test failed',
      },
      { status: 400 }
    );
  }
}
