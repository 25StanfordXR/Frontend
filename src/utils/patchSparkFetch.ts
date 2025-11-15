const SPARK_WASM_PREFIX = 'data:application/wasm;base64,';
const SPARK_PACKAGE_HINT = '@sparkjsdev/spark';

declare global {
  interface Window {
    __sparkWasmFetchShimApplied?: boolean;
  }
}

type FetchInput = Parameters<typeof fetch>[0];

const isRequestInstance = (value: FetchInput): value is Request =>
  typeof Request !== 'undefined' && value instanceof Request;

const isUrlInstance = (value: FetchInput): value is URL =>
  value instanceof URL;

const extractUrl = (input: FetchInput): string | undefined => {
  if (typeof input === 'string') {
    return input;
  }

  if (isRequestInstance(input)) {
    return input.url;
  }

  if (isUrlInstance(input)) {
    return input.href;
  }

  return undefined;
};

const stripBase64 = (url: string): string | null => {
  const prefixIndex = url.indexOf(SPARK_WASM_PREFIX);
  if (prefixIndex === -1) {
    return null;
  }

  let base64 = url.slice(prefixIndex + SPARK_WASM_PREFIX.length);
  const terminalIndex = base64.search(/[#?]/);
  if (terminalIndex !== -1) {
    base64 = base64.slice(0, terminalIndex);
  }

  try {
    base64 = decodeURIComponent(base64);
  } catch (_error) {
    // Ignore decoding failures – the string may already be decoded.
  }

  return base64.replace(/\s/g, '');
};

const decodeBase64ToBytes = (encoded: string): Uint8Array => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const createWasmResponseFactory = () => {
  const cache = new Map<string, Uint8Array>();

  return (url: string): Response => {
    const cacheKey = url.substring(url.indexOf(SPARK_WASM_PREFIX));
    let payload = cache.get(cacheKey);

    if (!payload) {
      const base64 = stripBase64(url);
      if (!base64) {
        throw new Error('Unable to locate Spark.js WASM payload.');
      }
      payload = decodeBase64ToBytes(base64);
      cache.set(cacheKey, payload);
    }

    return new Response(payload.slice(0), {
      status: 200,
      headers: {
        'Content-Type': 'application/wasm',
      },
    });
  };
};

if (typeof window !== 'undefined' && typeof window.fetch === 'function' && !window.__sparkWasmFetchShimApplied) {
  const originalFetch = window.fetch.bind(window);
  const respondWithWasm = createWasmResponseFactory();

  window.fetch = (input: FetchInput, init?: RequestInit) => {
    try {
      const url = extractUrl(input);
      if (url && url.includes(SPARK_PACKAGE_HINT) && url.includes(SPARK_WASM_PREFIX)) {
        return Promise.resolve(respondWithWasm(url));
      }
    } catch (error) {
      console.warn('[spark wasm shim] Failed to intercept request', error);
    }

    return originalFetch(input, init);
  };

  window.__sparkWasmFetchShimApplied = true;
}

export {};
