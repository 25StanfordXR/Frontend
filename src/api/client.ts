import { MapMatchResponse } from '../types';

const FALLBACK_BASE_URL = 'https://ybpang-1--world-map-matcher-fastapi-app.modal.run';
const rawBaseUrl = (import.meta.env.VITE_AGENT_API_BASE_URL ?? FALLBACK_BASE_URL).trim();
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const jsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

const withBase = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, `${API_BASE_URL}/`).toString();
};

const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json();
    if (typeof payload?.detail === 'string') {
      return payload.detail;
    }
    if (Array.isArray(payload?.detail) && payload.detail[0]?.msg) {
      return payload.detail[0].msg as string;
    }
  } catch (_error) {
    // Ignore JSON parsing errors and fall back to status text.
  }

  const reason = response.statusText || 'Unknown error';
  return `匹配服务返回 ${response.status}: ${reason}`;
};

interface MatchRequestOptions {
  signal?: AbortSignal;
}

export const agentApi = {
  baseUrl: API_BASE_URL,
  matchEndpoint: withBase('/maps/match'),
};

export async function requestMapMatch(prompt: string, options?: MatchRequestOptions): Promise<MapMatchResponse> {
  try {
    const response = await fetch(agentApi.matchEndpoint, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ prompt }),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response));
    }

    return (await response.json()) as MapMatchResponse;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('请求已被取消');
    }
    throw error;
  }
}

export const resolveAssetUrl = (path: string): string => withBase(path);
