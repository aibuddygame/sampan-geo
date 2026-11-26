import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/server/util/mongo";
import { sendEmail } from "@/src/server/util/mailer";

export interface AeoSearchResultItem {
  rank?: number;
  title?: string;
  href?: string;
  body?: string;
  matches_target?: boolean;
}

export interface AeoStepTelemetry {
  query?: string;
  result_count?: number;
  target_hit_count?: number;
  results?: AeoSearchResultItem[];
  url?: string;
  final_url?: string | null;
  title?: string;
  topic?: string;
  matches_target?: boolean;
  status_code?: number | null;
  full_extracted_chars?: number;
  extracted_chars?: number;
  focused_output_chars?: number;
  extracted_preview?: string;
  focused_extract?: string;
  duration_ms?: number;
  error?: string | null;
}

export interface AeoTraceStep {
  id?: string;
  seq: number;
  tool_name: string;
  arguments: Record<string, unknown>;
  model_output: string;
  telemetry: AeoStepTelemetry;
}

export interface AeoRunRecord {
  id: string;
  question: string;
  target_url?: string | null;
  target_domain?: string | null;
  model?: string;
  status: string;
  final_answer?: string | null;
  step_count?: number;
  error?: string | null;
}

interface AeoContactRequestPayload {
  name?: string;
  contact: string;
  notes?: string;
  run?: AeoRunRecord | null;
  steps?: AeoTraceStep[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const body: AeoContactRequestPayload = await req.json();

    const name = body.name?.trim() || "";
    const contact = body.contact?.trim() || "";
    const notes = body.notes?.trim() || "";
    const run = body.run ?? null;
    const steps = Array.isArray(body.steps) ? body.steps : [];

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact email or phone is required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const aeoLeadsCollection = db.collection("aeo_contact_leads");

    const targetHitSteps = steps.filter((s) =>
      Boolean(s.telemetry?.matches_target),
    );

    const record = {
      source: "aeo_helper",
      name: name || null,
      contact,
      notes: notes || null,
      runId: run?.id ?? null,
      question: run?.question ?? null,
      targetUrl: run?.target_url ?? null,
      targetDomain: run?.target_domain ?? null,
      stepCount: run?.step_count ?? steps.length,
      targetMatchCount: targetHitSteps.length,
      run,
      steps,
      createdAt: new Date().toISOString(),
    };

    const insertResult = await aeoLeadsCollection.insertOne(record);

    const subject = run?.target_domain
      ? `New AEO Inquiry (${run.target_domain} · ${targetHitSteps.length}/${steps.length} target matches)`
      : `New AEO Inquiry: ${contact}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">New GEO / AEO Potential Customer Inquiry</h2>
        <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td><strong>Name:</strong></td>
            <td>${escapeHtml(name || "Not provided")}</td>
          </tr>
          <tr>
            <td><strong>Contact:</strong></td>
            <td>${escapeHtml(contact)}</td>
          </tr>
          <tr>
            <td><strong>Notes:</strong></td>
            <td>${escapeHtml(notes || "None")}</td>
          </tr>
          <tr>
            <td><strong>Customer Question:</strong></td>
            <td>${escapeHtml(run?.question || "N/A")}</td>
          </tr>
          <tr>
            <td><strong>Target URL / Domain:</strong></td>
            <td>${escapeHtml(run?.target_url || run?.target_domain || "N/A")}</td>
          </tr>
          <tr>
            <td><strong>Agent Steps:</strong></td>
            <td>${escapeHtml(String(run?.step_count ?? steps.length))} (${escapeHtml(String(targetHitSteps.length))} target matches)</td>
          </tr>          
        </table>
      </div>
    `;

    // Alert staff without failing the request if SMTP has a transient issue
    sendEmail(subject, htmlBody);

    return NextResponse.json(
      {
        success: true,
        id: insertResult.insertedId.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/aeo-contact error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save AEO contact request.",
      },
      { status: 500 },
    );
  }
}
