// ============================================================================
// VoiceRecordButton — refactored with new token colors
// Source: new_Design_plan.md Task 6, ARCHITECTURE.md §Frontend
// idle = --color-voice-idle (green), recording = --color-recording (red) + pulse
// processing = --color-voice-processing (dark green)
// ============================================================================

'use client';

import React, { useCallback, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useVoiceRecorder, type RecordingState } from '@/hooks/useVoiceRecorder';
import type { Transaction } from '@/types';

interface VoiceRecordButtonProps {
  onTransactionParsed?: (transaction: Transaction) => void;
  onProcessingStart?: () => void;
  onError?: (error: string) => void;
}

export function VoiceRecordButton({
  onTransactionParsed,
  onProcessingStart,
  onError,
}: VoiceRecordButtonProps) {
  const { state, startRecording, stopRecording, audioBlob, duration, error } = useVoiceRecorder();
  const [processing, setProcessing] = useState(false);

  const currentState: RecordingState | 'processing' = processing ? 'processing' : state;

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      setProcessing(true);
      onProcessingStart?.();
      try {
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        const response = await fetch('/api/transactions/voice', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) {
          onTransactionParsed?.(data.data);
        } else {
          onError?.(data.error?.message || 'Failed to process voice input');
        }
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Network error');
      } finally {
        setProcessing(false);
      }
    },
    [onTransactionParsed, onProcessingStart, onError]
  );

  React.useEffect(() => {
    if (audioBlob && !processing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleRecordingComplete(audioBlob);
    }
  }, [audioBlob]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePress = useCallback(() => {
    if (currentState === 'recording') stopRecording();
    else if (currentState === 'idle') startRecording();
  }, [currentState, startRecording, stopRecording]);

  const cfg = {
    idle: {
      bg: 'bg-[var(--color-voice-idle)] hover:bg-[var(--color-primary-hover)]',
      ring: '',
      icon: <Mic className="w-8 h-8 text-white" aria-hidden />,
      label: 'Tap to speak',
      ariaLabel: 'Start voice recording',
    },
    recording: {
      bg: 'bg-[var(--color-recording)]',
      ring: 'animate-recording-pulse',
      icon: <Square className="w-7 h-7 text-white fill-white" aria-hidden />,
      label: `Recording ${duration}s`,
      ariaLabel: 'Stop recording',
    },
    processing: {
      bg: 'bg-[var(--color-voice-processing)]',
      ring: '',
      icon: <Loader2 className="w-8 h-8 text-white animate-spin" aria-hidden />,
      label: 'Processing…',
      ariaLabel: 'Processing voice input',
    },
  }[currentState];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handlePress}
        disabled={currentState === 'processing'}
        aria-label={cfg.ariaLabel}
        className={[
          'w-[72px] h-[72px] rounded-[var(--radius-full)] flex items-center justify-center',
          'shadow-[var(--shadow-lg)] cursor-pointer btn-press',
          'disabled:opacity-70 disabled:cursor-wait transition-colors duration-[var(--motion-duration-fast)]',
          cfg.bg,
          cfg.ring,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {cfg.icon}
      </button>

      <span
        className="text-[var(--text-sm)] font-medium text-[var(--color-text-secondary)]"
        aria-live="polite"
        aria-atomic="true"
      >
        {cfg.label}
      </span>

      {error && (
        <p className="text-[var(--text-sm)] text-[var(--color-danger)] text-center max-w-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
