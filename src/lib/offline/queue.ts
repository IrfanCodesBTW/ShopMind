// ============================================================================
// Offline Queue — Idempotent sync queue for offline support
// Source: PRD §2.2, ROADMAP Phase 4
// ============================================================================


export interface QueuedRequest {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

/**
 * Idempotent offline queue manager.
 * Stores pending writes in localStorage/IndexedDB when offline.
 */
export class OfflineQueueManager {
  private static STORAGE_KEY = 'shopmind_offline_queue';

  /**
   * Add a request to the sync queue.
   */
  static enqueue(url: string, method: 'POST' | 'PUT' | 'DELETE', body: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    const queue = this.getQueue();
    const request: QueuedRequest = {
      id: crypto.randomUUID(),
      url,
      method,
      body,
      timestamp: Date.now(),
      retries: 0,
    };

    queue.push(request);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    console.log(`[OfflineQueue] Enqueued request to ${url} (Queue size: ${queue.length})`);
  }

  /**
   * Get all queued requests.
   */
  static getQueue(): QueuedRequest[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear the queue.
   */
  static clearQueue(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Remove a request from the queue by ID.
   */
  static dequeue(id: string): void {
    if (typeof window === 'undefined') return;
    const queue = this.getQueue().filter((req) => req.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
  }

  /**
   * Attempt to sync all queued requests.
   * Runs sequentially to preserve chronological ordering.
   */
  static async sync(): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    if (typeof window === 'undefined') return { success: true, syncedCount: 0, errors: [] };

    const queue = this.getQueue();
    if (queue.length === 0) return { success: true, syncedCount: 0, errors: [] };

    console.log(`[OfflineQueue] Starting sync for ${queue.length} requests...`);
    const errors: string[] = [];
    let syncedCount = 0;

    for (const request of queue) {
      try {
        // Inject idempotency header so the server knows it's a re-submission
        const res = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': request.id,
          },
          body: JSON.stringify(request.body),
        });

        if (res.ok) {
          this.dequeue(request.id);
          syncedCount++;
        } else {
          request.retries++;
          const errText = await res.text();
          errors.push(`Failed sync for ${request.url}: ${res.status} - ${errText}`);
          
          // If server error is a validation error (400) or unauthorized (401),
          // don't block the queue forever — remove it.
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            this.dequeue(request.id);
          } else {
            // Server error (500, 503) — stop sync loop to preserve ordering
            break;
          }
        }
      } catch (err) {
        errors.push(`Network error syncing ${request.url}: ${err instanceof Error ? err.message : 'Unknown'}`);
        // Network offline — stop sync loop
        break;
      }
    }

    // Save updated queue with retry counts
    const currentQueue = this.getQueue();
    const updatedQueue = currentQueue.map((req) => {
      const match = queue.find((q) => q.id === req.id);
      return match ? { ...req, retries: match.retries } : req;
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedQueue));

    return {
      success: errors.length === 0,
      syncedCount,
      errors,
    };
  }
}
