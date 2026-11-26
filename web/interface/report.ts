// interface/seo.ts

export type SeoCategory =
  | "meta"
  | "content"
  | "technical"
  | "links_images"
  | "social";

export type IssueSeverity = "pass" | "warning" | "critical";

/**
 * Payload sent from the UI to POST /api/audit
 */
export interface AuditRequest {
  url: string;
}

/**
 * Raw metadata and signals extracted from the target webpage via Cheerio
 */
export interface ExtractedPageData {
  finalUrl: string;
  statusCode: number;
  responseTimeMs: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  viewportMeta: string | null;
  lang: string | null;
  headings: {
    h1: string[];
    h2: string[];
    h3Count: number;
  };
  images: {
    total: number;
    missingAlt: number;
    missingAltSources: string[]; // Sample URLs of images without alt text
  };
  links: {
    internal: number;
    external: number;
    brokenOrEmpty: number;
  };
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
  };
  structuredDataCount: number; // Number of application/ld+json scripts found
  wordCount: number;
}

/**
 * An individual evaluated SEO check (e.g., "Title Tag Length", "H1 Presence")
 */
export interface SeoCheckItem {
  id: string;
  category: SeoCategory;
  name: string;
  severity: IssueSeverity;
  score: number; // Points earned on this check
  maxScore: number; // Maximum possible points for this check
  currentValue: string; // What was actually found on the page
}

/**
 * Aggregated score for a single category (e.g., Technical SEO: 18/25)
 */
export interface CategoryScore {
  category: SeoCategory;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  passedCount: number;
  warningCount: number;
  criticalCount: number;
}

/**
 * Full response returned by POST /api/audit
 */
export interface AuditReport {
  id: string;
  auditedAt: string; // ISO timestamp
  url: string;
  overallScore: number; // 0 - 100
  grade: "A" | "B" | "C" | "D" | "F";
  categoryScores: CategoryScore[];
  checks: SeoCheckItem[];
  rawMetadata: ExtractedPageData;
}

/**
 * Standardized API wrapper for error handling in the UI
 */
export interface AuditApiResponse {
  success: boolean;
  data?: AuditReport;
  error?: string;
}
