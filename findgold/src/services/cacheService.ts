interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 heure

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private generateKey(location: string, radius: number, type: string): string {
    return `${location}_${radius}_${type}`;
  }

  public set<T>(location: string, radius: number, type: string, data: T): void {
    const key = this.generateKey(location, radius, type);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }

  public get<T>(location: string, radius: number, type: string): T | null {
    const key = this.generateKey(location, radius, type);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier si le cache est expiré
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public clear(): void {
    this.cache.clear();
  }

  public clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheService = CacheService.getInstance();
