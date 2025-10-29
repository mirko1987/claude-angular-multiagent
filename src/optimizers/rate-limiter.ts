export class RateLimiter {
  private requestsPerMinute: number;
  private requests: Date[] = [];
  private windowMs: number = 60000; // 1 minute

  constructor(requestsPerMinute?: number) {
    this.requestsPerMinute =
      requestsPerMinute ||
      parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '50');
  }

  async waitIfNeeded(): Promise<void> {
    this.cleanupOldRequests();

    if (this.requests.length >= this.requestsPerMinute) {
      const oldestRequest = this.requests[0];
      const timeSinceOldest = Date.now() - oldestRequest.getTime();
      const waitTime = this.windowMs - timeSinceOldest;

      if (waitTime > 0) {
        await this.sleep(waitTime);
        this.cleanupOldRequests();
      }
    }

    this.requests.push(new Date());
  }

  private cleanupOldRequests(): void {
    const cutoff = Date.now() - this.windowMs;
    this.requests = this.requests.filter(
      req => req.getTime() > cutoff
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentUsage(): {
    requests: number;
    limit: number;
    percentage: number;
  } {
    this.cleanupOldRequests();
    return {
      requests: this.requests.length,
      limit: this.requestsPerMinute,
      percentage: (this.requests.length / this.requestsPerMinute) * 100,
    };
  }

  reset(): void {
    this.requests = [];
  }

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitIfNeeded();
    return fn();
  }
}
