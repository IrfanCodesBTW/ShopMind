// ============================================================================
// Groq Whisper STT Service — Stage 1 of AI Pipeline
// Source: AI_ARCHITECTURE.md §Stage 1: Speech-to-Text
// ============================================================================

import type { SupportedLanguage } from '@/types';

interface STTResult {
  transcript: string;
  language?: string;
  duration?: number;
}

interface STTError {
  error: string;
  code?: string;
}

/**
 * Transcribe audio using Groq's Whisper large-v3 model.
 * Source: AI_ARCHITECTURE.md Stage 1, PRD.md §4.2
 */
export async function transcribeAudio(
  audioBlob: Blob | Buffer,
  languageHint?: SupportedLanguage
): Promise<STTResult | STTError> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { error: 'GROQ_API_KEY not configured', code: 'CONFIG_ERROR' };
  }

  try {
    const formData = new FormData();

    // Handle both Blob (from browser) and Buffer (from server)
    if (audioBlob instanceof Blob) {
      formData.append('file', audioBlob, 'audio.webm');
    } else {
      formData.append('file', new Blob([new Uint8Array(audioBlob)]), 'audio.webm');
    }

    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'json');

    // Language hint for faster/more accurate detection
    if (languageHint) {
      const langMap: Record<SupportedLanguage, string> = {
        en: 'en',
        hi: 'hi',
        te: 'te',
      };
      formData.append('language', langMap[languageHint] || 'en');
    }

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
      signal: AbortSignal.timeout(15000), // 15s timeout for STT
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `Groq Whisper API error: ${response.status} - ${errorText}`,
        code: response.status === 429 ? 'RATE_LIMITED' : 'API_ERROR',
      };
    }

    const data = await response.json();

    return {
      transcript: data.text || '',
      language: data.language,
      duration: data.duration,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { error: 'STT request timed out', code: 'TIMEOUT' };
    }
    return {
      error: `STT failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      code: 'NETWORK_ERROR',
    };
  }
}
