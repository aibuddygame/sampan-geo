import { NextRequest, NextResponse } from "next/server";
import { AuditReport } from "@/interface/report";
import { getDb } from "@/src/server/util/mongo";
import { sendEmail } from "@/src/server/util/mailer";

interface ContactRequestPayload {
  name?: string;
  contact: string;
  notes?: string;
  report?: AuditReport | null;
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
    const body: ContactRequestPayload = await req.json();

    const name = body.name?.trim() || "";
    const contact = body.contact?.trim() || "";
    const notes = body.notes?.trim() || "";
    const report = body.report ?? null;

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact email or phone is required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const leadsCollection = db.collection("contact_leads");

    const record = {
      name: name || null,
      contact,
      notes: notes || null,
      auditedUrl: report?.url ?? null,
      overallScore: report?.overallScore ?? null,
      grade: report?.grade ?? null,
      report,
      createdAt: new Date().toISOString(),
    };

    const insertResult = await leadsCollection.insertOne(record);

    const subject = report?.url
      ? `New Potential Customer (${report.url} · Score ${report.overallScore}/100)`
      : `New Potential Customer: ${contact}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">New Potential Customer Inquiry</h2>
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
            <td><strong>Audited URL:</strong></td>
            <td>${escapeHtml(report?.url || "N/A")}</td>
          </tr>
          <tr>
            <td><strong>SEO Score:</strong></td>
            <td>${
              report
                ? `${report.overallScore}/100 (Grade ${report.grade})`
                : "N/A"
            }</td>
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
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save contact request.",
      },
      { status: 500 },
    );
  }
}
