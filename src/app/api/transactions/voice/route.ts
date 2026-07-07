// ============================================================================
// POST /api/transactions/voice — Voice Transaction Processing
// Source: API_SPEC.md §POST /transactions/voice, AI_ARCHITECTURE.md
// Accepts multipart audio, runs STT + parsing pipeline, returns parsed tx.
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { transcribeAudio } from '@/services/stt/groq-whisper';
import { runPipeline } from '@/services/parsers/pipeline';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { MerchantContext, SupportedLanguage } from '@/types';

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    // 2. Extract audio from multipart form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const languageOverride = formData.get('language') as string | null;

    if (!audioFile) {
      return Errors.validation('Audio file is required', [
        { field: 'audio', message: 'No audio file provided' },
      ]);
    }

    // Validate file size (max 10MB per API_SPEC.md)
    if (audioFile.size > 10 * 1024 * 1024) {
      return Errors.invalidAudio('Audio file exceeds 10MB limit');
    }

    // 3. Speech-to-Text via Groq Whisper
    const language = (languageOverride || user.merchant?.language_preference || 'en') as SupportedLanguage;
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const sttResult = await transcribeAudio(audioBuffer, language);

    if ('error' in sttResult) {
      if (sttResult.code === 'RATE_LIMITED') {
        return Errors.rateLimited('Speech-to-text service is temporarily busy');
      }
      return Errors.providerUnavailable(`Transcription failed: ${sttResult.error}`);
    }

    if (!sttResult.transcript || sttResult.transcript.trim().length === 0) {
      return Errors.validation('Could not detect any speech in the audio', [
        { field: 'audio', message: 'No speech detected' },
      ]);
    }

    // 4. Build merchant context for better parsing
    const supabase = await createServerSupabaseClient();
    const merchantContext: MerchantContext = {
      businessType: 'general retail', // Default; can be enriched from merchant profile
      commonItems: [],
      regularCustomers: [],
      preferredLanguage: language,
    };

    // Fetch common items and customers for context injection
    if (user.merchant) {
      const [itemsResult, customersResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('item')
          .eq('merchant_id', user.id)
          .not('item', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('customers')
          .select('name')
          .eq('merchant_id', user.id)
          .limit(20),
      ]);

      if (itemsResult.data) {
        const uniqueItems = [...new Set(itemsResult.data.map((r) => r.item).filter(Boolean))];
        merchantContext.commonItems = uniqueItems as string[];
      }
      if (customersResult.data) {
        merchantContext.regularCustomers = customersResult.data.map((r) => r.name);
      }
    }

    // 5. Run AI parsing pipeline
    const pipelineResult = await runPipeline(sttResult.transcript, merchantContext);

    // 6. If all parsers failed, return low-confidence error with transcript
    if (pipelineResult.requiresManualEntry) {
      return Errors.lowConfidence(
        'Could not confidently parse the transaction. Please review.',
        {
          raw_transcript: sttResult.transcript,
          normalized_transcript: pipelineResult.normalizedTranscript,
          attempts: pipelineResult.attempts,
        }
      );
    }

    // 7. Save pending transaction to database
    const parsed = pipelineResult.result.data!;

    const { data: transaction, error: insertError } = await supabase
      .from('transactions')
      .insert({
        merchant_id: user.id,
        intent: parsed.intent,
        item: parsed.item || null,
        quantity: parsed.quantity || null,
        unit: parsed.unit || null,
        amount: parsed.amount || 0,
        customer_name: parsed.customer || null,
        payment_mode: parsed.payment_mode || null,
        due_status: parsed.due_status || 'none',
        confidence_score: parsed.confidence,
        raw_transcript: sttResult.transcript,
        provider_used: parsed.provider_used,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Transaction insert error:', insertError);
      return Errors.internal('Failed to save transaction');
    }

    return successResponse(transaction, undefined, 201);
  } catch (err) {
    console.error('Voice transaction error:', err);
    return Errors.internal('An unexpected error occurred while processing voice input');
  }
}
