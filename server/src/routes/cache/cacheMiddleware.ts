import { getCache, setCache } from "./cacheStore";

const cacheMiddleware = (ttlMs: number) => {
  return (req: any, res: any, next: any) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = req.originalUrl;

    const cached = getCache(key);

    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);

    res.json = (data: any) => {
      setCache(key, data, ttlMs);
      return originalJson(data);
    };

    next();
  };
};

export { cacheMiddleware };