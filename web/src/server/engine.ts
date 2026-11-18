import {
  CategoryScore,
  ExtractedPageData,
  SeoCategory,
  SeoCheckItem,
} from "@/interface/report";
import * as cheerio from "cheerio";

const CATEGORY_LABELS: Record<SeoCategory, string> = {
  meta: "Meta & Indexing",
  content: "Content & Headings",
  technical: "Technical SEO",
  links_images: "Links & Media",
  social: "Social & Open Graph",
};

/**
 * Fetches a URL and extracts structured SEO metadata via Cheerio.
 */
export async function extractPageData(
  rawUrl: string,
): Promise<ExtractedPageData> {
  const normalizedUrl = /^https?:\/\//i.test(rawUrl.trim())
    ? rawUrl.trim()
    : `https://${rawUrl.trim()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

  const startTime = Date.now();
  let response: Response;

  try {
    response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEO-AI-Auditor/1.0; +https://github.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }

  const responseTimeMs = Date.now() - startTime;
  const html = await response.text();
  const $ = cheerio.load(html);

  // Basic meta tags
  const title = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() || null;
  const robotsMeta = $('meta[name="robots"]').attr("content")?.trim() || null;
  const viewportMeta =
    $('meta[name="viewport"]').attr("content")?.trim() || null;
  const lang = $("html").attr("lang")?.trim() || null;

  // Headings
  const h1 = $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  const h2 = $("h2")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  const h3Count = $("h3").length;

  // Images
  const allImages = $("img");
  const missingAltSources: string[] = [];
  allImages.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined || alt.trim() === "") {
      const src = $(el).attr("src") || "(inline/no src)";
      if (missingAltSources.length < 5) {
        missingAltSources.push(src);
      }
    }
  });

  // Links
  const baseHost = new URL(response.url || normalizedUrl).hostname;
  let internal = 0;
  let external = 0;
  let brokenOrEmpty = 0;

  $("a").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href || href === "#" || href.startsWith("javascript:")) {
      brokenOrEmpty++;
      return;
    }
    try {
      const resolved = new URL(href, response.url || normalizedUrl);
      if (resolved.hostname === baseHost) {
        internal++;
      } else {
        external++;
      }
    } catch {
      brokenOrEmpty++;
    }
  });

  // Open Graph
  const ogTitle =
    $('meta[property="og:title"]').attr("content")?.trim() || null;
  const ogDescription =
    $('meta[property="og:description"]').attr("content")?.trim() || null;
  const ogImage =
    $('meta[property="og:image"]').attr("content")?.trim() || null;

  // JSON-LD Structured Data
  const structuredDataCount = $('script[type="application/ld+json"]').length;

  // Body Word Count (strip scripts/styles first)
  $("script, style, noscript").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").length : 0;

  return {
    finalUrl: response.url || normalizedUrl,
    statusCode: response.status,
    responseTimeMs,
    title,
    titleLength: title ? title.length : 0,
    metaDescription,
    metaDescriptionLength: metaDescription ? metaDescription.length : 0,
    canonicalUrl,
    robotsMeta,
    viewportMeta,
    lang,
    headings: { h1, h2, h3Count },
    images: {
      total: allImages.length,
      missingAlt: missingAltSources.length,
      missingAltSources,
    },
    links: { internal, external, brokenOrEmpty },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
    },
    structuredDataCount,
    wordCount,
  };
}

/**
 * Evaluates extracted page data against 10 weighted SEO checks (100 pts total).
 */
export function evaluateSeoChecks(data: ExtractedPageData): {
  checks: SeoCheckItem[];
  categoryScores: CategoryScore[];
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
} {
  const checks: SeoCheckItem[] = [];

  // 1. META: Title Tag (15 pts)
  if (!data.title) {
    checks.push({
      id: "title-tag",
      category: "meta",
      name: "Title Tag Presence & Length",
      severity: "critical",
      score: 0,
      maxScore: 15,
      currentValue: "Missing <title> tag",
    });
  } else if (data.titleLength < 30 || data.titleLength > 60) {
    checks.push({
      id: "title-tag",
      category: "meta",
      name: "Title Tag Presence & Length",
      severity: "warning",
      score: 9,
      maxScore: 15,
      currentValue: `"${data.title}" (${data.titleLength} chars — ideal is 30–60)`,
    });
  } else {
    checks.push({
      id: "title-tag",
      category: "meta",
      name: "Title Tag Presence & Length",
      severity: "pass",
      score: 15,
      maxScore: 15,
      currentValue: `"${data.title}" (${data.titleLength} chars)`,
    });
  }

  // 2. META: Meta Description (15 pts)
  if (!data.metaDescription) {
    checks.push({
      id: "meta-description",
      category: "meta",
      name: "Meta Description",
      severity: "critical",
      score: 0,
      maxScore: 15,
      currentValue: "Missing meta description",
    });
  } else if (
    data.metaDescriptionLength < 110 ||
    data.metaDescriptionLength > 160
  ) {
    checks.push({
      id: "meta-description",
      category: "meta",
      name: "Meta Description",
      severity: "warning",
      score: 9,
      maxScore: 15,
      currentValue: `${data.metaDescriptionLength} chars (ideal is 110–160)`,
    });
  } else {
    checks.push({
      id: "meta-description",
      category: "meta",
      name: "Meta Description",
      severity: "pass",
      score: 15,
      maxScore: 15,
      currentValue: `${data.metaDescriptionLength} chars`,
    });
  }

  // 3. CONTENT: H1 Heading Structure (10 pts)
  if (data.headings.h1.length === 0) {
    checks.push({
      id: "h1-heading",
      category: "content",
      name: "H1 Heading Tag",
      severity: "critical",
      score: 0,
      maxScore: 10,
      currentValue: "No <h1> tag found",
    });
  } else if (data.headings.h1.length > 1) {
    checks.push({
      id: "h1-heading",
      category: "content",
      name: "H1 Heading Tag",
      severity: "warning",
      score: 6,
      maxScore: 10,
      currentValue: `Multiple <h1> tags found (${data.headings.h1.length})`,
    });
  } else {
    checks.push({
      id: "h1-heading",
      category: "content",
      name: "H1 Heading Tag",
      severity: "pass",
      score: 10,
      maxScore: 10,
      currentValue: `"${data.headings.h1[0]}"`,
    });
  }

  // 4. CONTENT: Word Count & Subheadings (10 pts)
  if (data.wordCount < 150) {
    checks.push({
      id: "content-depth",
      category: "content",
      name: "Content Depth & Subheadings",
      severity: "critical",
      score: 2,
      maxScore: 10,
      currentValue: `${data.wordCount} words, ${data.headings.h2.length} H2s (thin content)`,
    });
  } else if (data.wordCount < 300 || data.headings.h2.length === 0) {
    checks.push({
      id: "content-depth",
      category: "content",
      name: "Content Depth & Subheadings",
      severity: "warning",
      score: 6,
      maxScore: 10,
      currentValue: `${data.wordCount} words, ${data.headings.h2.length} H2s`,
    });
  } else {
    checks.push({
      id: "content-depth",
      category: "content",
      name: "Content Depth & Subheadings",
      severity: "pass",
      score: 10,
      maxScore: 10,
      currentValue: `${data.wordCount} words, ${data.headings.h2.length} H2s`,
    });
  }

  // 5. TECHNICAL: HTTPS & Canonical URL (10 pts)
  const isHttps = data.finalUrl.startsWith("https://");
  if (!isHttps) {
    checks.push({
      id: "https-canonical",
      category: "technical",
      name: "HTTPS & Canonical URL",
      severity: "critical",
      score: 0,
      maxScore: 10,
      currentValue: "Site not served over HTTPS",
    });
  } else if (!data.canonicalUrl) {
    checks.push({
      id: "https-canonical",
      category: "technical",
      name: "HTTPS & Canonical URL",
      severity: "warning",
      score: 6,
      maxScore: 10,
      currentValue: "HTTPS active, but missing <link rel='canonical'>",
    });
  } else {
    checks.push({
      id: "https-canonical",
      category: "technical",
      name: "HTTPS & Canonical URL",
      severity: "pass",
      score: 10,
      maxScore: 10,
      currentValue: `HTTPS + Canonical (${data.canonicalUrl})`,
    });
  }

  // 6. TECHNICAL: Mobile Viewport & HTML Lang (10 pts)
  if (!data.viewportMeta && !data.lang) {
    checks.push({
      id: "viewport-lang",
      category: "technical",
      name: "Mobile Viewport & Language",
      severity: "critical",
      score: 0,
      maxScore: 10,
      currentValue: "Missing viewport meta tag and html lang attribute",
    });
  } else if (!data.viewportMeta || !data.lang) {
    checks.push({
      id: "viewport-lang",
      category: "technical",
      name: "Mobile Viewport & Language",
      severity: "warning",
      score: 5,
      maxScore: 10,
      currentValue: `Viewport: ${data.viewportMeta ? "Set" : "Missing"}, Lang: ${data.lang || "Missing"}`,
    });
  } else {
    checks.push({
      id: "viewport-lang",
      category: "technical",
      name: "Mobile Viewport & Language",
      severity: "pass",
      score: 10,
      maxScore: 10,
      currentValue: `Viewport set, lang="${data.lang}"`,
    });
  }

  // 7. TECHNICAL: Structured Data / JSON-LD (5 pts)
  if (data.structuredDataCount === 0) {
    checks.push({
      id: "structured-data",
      category: "technical",
      name: "Structured Data (JSON-LD)",
      severity: "warning",
      score: 0,
      maxScore: 5,
      currentValue: "No JSON-LD schema detected",
    });
  } else {
    checks.push({
      id: "structured-data",
      category: "technical",
      name: "Structured Data (JSON-LD)",
      severity: "pass",
      score: 5,
      maxScore: 5,
      currentValue: `${data.structuredDataCount} schema block(s) found`,
    });
  }

  // 8. LINKS & IMAGES: Image Alt Attributes (10 pts)
  if (data.images.total > 0 && data.images.missingAlt > 0) {
    const ratio = data.images.missingAlt / data.images.total;
    checks.push({
      id: "image-alt",
      category: "links_images",
      name: "Image Alt Attributes",
      severity: ratio > 0.4 ? "critical" : "warning",
      score: ratio > 0.4 ? 2 : 6,
      maxScore: 10,
      currentValue: `${data.images.missingAlt} of ${data.images.total} images missing alt text`,
    });
  } else {
    checks.push({
      id: "image-alt",
      category: "links_images",
      name: "Image Alt Attributes",
      severity: "pass",
      score: 10,
      maxScore: 10,
      currentValue:
        data.images.total === 0
          ? "No images to audit"
          : `All ${data.images.total} images have alt text`,
    });
  }

  // 9. LINKS & IMAGES: Internal & Valid Links (5 pts)
  if (data.links.internal === 0 || data.links.brokenOrEmpty > 2) {
    checks.push({
      id: "link-health",
      category: "links_images",
      name: "Internal & Empty Links",
      severity: "warning",
      score: 2,
      maxScore: 5,
      currentValue: `${data.links.internal} internal, ${data.links.brokenOrEmpty} empty/invalid hrefs`,
    });
  } else {
    checks.push({
      id: "link-health",
      category: "links_images",
      name: "Internal & Empty Links",
      severity: "pass",
      score: 5,
      maxScore: 5,
      currentValue: `${data.links.internal} internal, ${data.links.external} external links`,
    });
  }

  // 10. SOCIAL: Open Graph Tags (10 pts)
  const ogPresent = [
    data.openGraph.title,
    data.openGraph.description,
    data.openGraph.image,
  ].filter(Boolean).length;

  if (ogPresent === 0) {
    checks.push({
      id: "open-graph",
      category: "social",
      name: "Open Graph Social Tags",
      severity: "critical",
      score: 0,
      maxScore: 10,
      currentValue: "Missing og:title, og:description, and og:image",
    });
  } else if (ogPresent < 3) {
    checks.push({
      id: "open-graph",
      category: "social",
      name: "Open Graph Social Tags",
      severity: "warning",
      score: 5,
      maxScore: 10,
      currentValue: `${ogPresent}/3 core Open Graph tags present`,
    });
  } else {
    checks.push({
      id: "open-graph",
      category: "social",
      name: "Open Graph Social Tags",
      severity: "pass",
      score: 10,
      maxScore: 10,
      currentValue: "og:title, og:description, and og:image present",
    });
  }

  // Roll up category scores
  const categories: SeoCategory[] = [
    "meta",
    "content",
    "technical",
    "links_images",
    "social",
  ];

  const categoryScores: CategoryScore[] = categories.map((cat) => {
    const catChecks = checks.filter((c) => c.category === cat);
    const score = catChecks.reduce((sum, c) => sum + c.score, 0);
    const maxScore = catChecks.reduce((sum, c) => sum + c.maxScore, 0);
    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 100,
      passedCount: catChecks.filter((c) => c.severity === "pass").length,
      warningCount: catChecks.filter((c) => c.severity === "warning").length,
      criticalCount: catChecks.filter((c) => c.severity === "critical").length,
    };
  });

  const overallScore = checks.reduce((sum, c) => sum + c.score, 0);
  const grade =
    overallScore >= 90
      ? "A"
      : overallScore >= 80
        ? "B"
        : overallScore >= 70
          ? "C"
          : overallScore >= 60
            ? "D"
            : "F";

  return { checks, categoryScores, overallScore, grade };
}
