
export interface HealthResponse {
  ok: boolean;
  db: string;
  timestamp: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  body: string;
  highlights: string[];
  tags: string[];
  techStack: string[];   // alias of tags
  url: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  images: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  tags: string[];
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  tags: string[];
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSource {
  id: number;          // matches inline [1], [2] markers in answer text
  title: string;       // e.g. "Project: Alaala Collections - Event Management Platform"
  url: string | null;  // internal route "/work/{slug}" or "/about", or external http(s)
  chunk_id: number;
  similarity: number;  // 0.5001 – 1.0000
}

export interface ChatRequest {
  question: string;    // required, min 2, max 1000 chars
}

export interface ChatResponse {
  log_id: number;
  answer: string;      // markdown with inline [1], [2] citations
  sources: ChatSource[];
  latency_ms: number;
  no_match: boolean;
}

export interface ChatFeedbackRequest {
  log_id: number;
  value: 1 | -1;
}

export interface ChatFeedbackResponse {
  ok: boolean;
}