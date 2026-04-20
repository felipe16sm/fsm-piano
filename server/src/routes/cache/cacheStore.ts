type CacheItem = {
  value: any;
  expiry: number;
};

const cache = new Map<string, CacheItem>();

const getCache = (key: string) => {
  const cached = cache.get(key);

  if (cached && Date.now() < cached.expiry) {
    return cached.value;
  }

  return null;
};

const setCache = (key: string, value: any, ttlMs: number) => {
  cache.set(key, {
    value,
    expiry: Date.now() + ttlMs,
  });
};

const invalidateCache = (pattern: string) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

export { getCache, setCache, invalidateCache };