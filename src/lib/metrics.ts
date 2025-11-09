/**
 * Metrics Collection
 *
 * Provides in-memory metrics collection for monitoring application performance.
 * Metrics can be exposed via health check endpoint or exported to monitoring systems.
 */

interface MetricValue {
  count: number;
  sum: number;
  min: number;
  max: number;
  last: number;
  timestamp: number;
}

interface Metrics {
  counters: Map<string, number>;
  gauges: Map<string, number>;
  histograms: Map<string, MetricValue>;
}

class MetricsCollector {
  private metrics: Metrics = {
    counters: new Map(),
    gauges: new Map(),
    histograms: new Map(),
  };

  /**
   * Increment a counter metric
   */
  counter(name: string, value: number = 1, tags?: Record<string, string>) {
    const key = this.buildKey(name, tags);
    const current = this.metrics.counters.get(key) || 0;
    this.metrics.counters.set(key, current + value);
  }

  /**
   * Set a gauge metric (absolute value)
   */
  gauge(name: string, value: number, tags?: Record<string, string>) {
    const key = this.buildKey(name, tags);
    this.metrics.gauges.set(key, value);
  }

  /**
   * Record a histogram value (for timing, sizes, etc.)
   */
  histogram(name: string, value: number, tags?: Record<string, string>) {
    const key = this.buildKey(name, tags);
    const current = this.metrics.histograms.get(key);

    if (!current) {
      this.metrics.histograms.set(key, {
        count: 1,
        sum: value,
        min: value,
        max: value,
        last: value,
        timestamp: Date.now(),
      });
    } else {
      this.metrics.histograms.set(key, {
        count: current.count + 1,
        sum: current.sum + value,
        min: Math.min(current.min, value),
        max: Math.max(current.max, value),
        last: value,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, {
      count: number;
      sum: number;
      min: number;
      max: number;
      avg: number;
      last: number;
    }>;
  } {
    const histograms: Record<string, any> = {};
    this.metrics.histograms.forEach((value, key) => {
      histograms[key] = {
        ...value,
        avg: value.sum / value.count,
      };
    });

    return {
      counters: Object.fromEntries(this.metrics.counters),
      gauges: Object.fromEntries(this.metrics.gauges),
      histograms,
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.counters.clear();
    this.metrics.gauges.clear();
    this.metrics.histograms.clear();
  }

  /**
   * Build metric key with tags
   */
  private buildKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }

    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    return `${name}{${tagString}}`;
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

/**
 * Utility to measure function execution time
 */
export function measureTime<T>(
  name: string,
  fn: () => T | Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = Date.now();

  const recordMetric = (error?: Error) => {
    const duration = Date.now() - start;
    metrics.histogram(name, duration, {
      ...tags,
      status: error ? 'error' : 'success',
    });
  };

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then((value) => {
          recordMetric();
          return value;
        })
        .catch((error) => {
          recordMetric(error);
          throw error;
        });
    }

    recordMetric();
    return Promise.resolve(result);
  } catch (error) {
    recordMetric(error as Error);
    throw error;
  }
}

export default metrics;
