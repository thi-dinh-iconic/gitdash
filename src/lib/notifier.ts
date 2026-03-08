/**
 * Alert notifier abstraction.
 *
 * Provides a unified interface for delivering alerts through browser (local),
 * Slack (webhook), and email (SMTP via Resend or SMTP env vars) channels.
 * Each provider is a pure function; no state is held here.
 */

import type { DbAlertRule } from "./db";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlertPayload {
  rule: DbAlertRule;
  repo: string;
  value: number;
  metricLabel: string;
  metricUnit: string;
  triggeredAt: string;
  eventId?: number;
}

export type DeliveryResult =
  | { ok: true }
  | { ok: false; error: string };

// ── Metric label map ──────────────────────────────────────────────────────────

export const METRIC_LABELS: Record<string, { label: string; unit: string }> = {
  failure_rate:           { label: "Failure Rate",          unit: "%" },
  duration_p95:           { label: "Duration P95",          unit: " min" },
  queue_wait_p95:         { label: "Queue Wait P95",        unit: " min" },
  success_streak:         { label: "Failure Streak",        unit: " runs" },
  pr_throughput_drop:     { label: "PR Throughput Drop",    unit: "%" },
  review_response_p90:    { label: "Review Response P90",   unit: " hrs" },
  afterhours_commit_pct:  { label: "After-Hours Commits",   unit: "%" },
  pr_abandon_rate:        { label: "PR Abandon Rate",       unit: "%" },
  unreviewed_pr_age:      { label: "Unreviewed PR Age",     unit: " days" },
};

export function buildPayload(
  rule: DbAlertRule,
  repo: string,
  value: number,
  eventId?: number,
): AlertPayload {
  const meta = METRIC_LABELS[rule.metric] ?? { label: rule.metric, unit: "" };
  return {
    rule,
    repo,
    value,
    metricLabel: meta.label,
    metricUnit: meta.unit,
    triggeredAt: new Date().toISOString(),
    eventId,
  };
}

// ── Browser / local delivery (no-op server-side, UI-handled) ─────────────────

/**
 * Browser notifications are handled on the client side via the Web Notifications
 * API. Server-side we record the event and return ok — the client polls
 * alert_events and shows the browser notification.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deliverBrowser(_payload: AlertPayload): Promise<DeliveryResult> {
  return { ok: true };
}

// ── Slack delivery ────────────────────────────────────────────────────────────

export async function deliverSlack(payload: AlertPayload): Promise<DeliveryResult> {
  const { rule, repo, value, metricLabel, metricUnit, triggeredAt } = payload;
  if (!rule.destination) {
    return { ok: false, error: "No Slack webhook URL configured" };
  }

  const text =
    `*GitDash Alert* — \`${repo}\`\n` +
    `*${metricLabel}* exceeded threshold\n` +
    `Value: *${value}${metricUnit}* (threshold: ${rule.threshold}${metricUnit})\n` +
    `Window: ${rule.window_hours}h — triggered at ${triggeredAt}`;

  const body = JSON.stringify({
    text,
    blocks: [{ type: "section", text: { type: "mrkdwn", text } }],
  });

  try {
    const res = await fetch(rule.destination, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!res.ok) {
      return { ok: false, error: `Slack webhook returned ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Email delivery ────────────────────────────────────────────────────────────

/**
 * Email delivery via Resend (RESEND_API_KEY) or a generic SMTP provider
 * (SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM).
 * Resend is preferred when RESEND_API_KEY is set.
 */
export async function deliverEmail(payload: AlertPayload): Promise<DeliveryResult> {
  const { rule, repo, value, metricLabel, metricUnit, triggeredAt } = payload;

  if (!rule.destination) {
    return { ok: false, error: "No email destination configured" };
  }

  const subject = `[GitDash] ${metricLabel} alert — ${repo}`;
  const html = `
    <h2>GitDash Alert</h2>
    <p><strong>Repository:</strong> ${repo}</p>
    <p><strong>Metric:</strong> ${metricLabel}</p>
    <p><strong>Value:</strong> ${value}${metricUnit} (threshold: ${rule.threshold}${metricUnit})</p>
    <p><strong>Window:</strong> ${rule.window_hours} hours</p>
    <p><strong>Triggered at:</strong> ${triggeredAt}</p>
    <hr/>
    <p style="color:#888;font-size:12px">Sent by GitDash alert system. To disable this alert, update the rule in the Alerts page.</p>
  `;
  const text =
    `GitDash Alert — ${repo}\n` +
    `Metric: ${metricLabel}\n` +
    `Value: ${value}${metricUnit} (threshold: ${rule.threshold}${metricUnit})\n` +
    `Window: ${rule.window_hours}h — triggered at ${triggeredAt}`;

  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    return deliverViaResend(rule.destination, subject, html, text, resendKey);
  }

  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    return deliverViaSendgridCompat(rule.destination, subject, text, html);
  }

  return { ok: false, error: "No email provider configured. Set RESEND_API_KEY or SMTP_HOST." };
}

async function deliverViaResend(
  to: string,
  subject: string,
  html: string,
  text: string,
  apiKey: string,
): Promise<DeliveryResult> {
  const from = process.env.RESEND_FROM ?? "alerts@gitdash.app";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Resend returned ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Minimal SMTP-over-HTTP using SendGrid-compatible API as fallback.
 * Requires SMTP_HOST to equal "https://api.sendgrid.com" or similar.
 * For full SMTP support, inject a server-side mailer (e.g., nodemailer).
 */
async function deliverViaSendgridCompat(
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<DeliveryResult> {
  const apiKey = process.env.SMTP_PASS ?? process.env.SENDGRID_API_KEY;
  const from   = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "alerts@gitdash.app";
  const host   = process.env.SMTP_HOST ?? "";

  if (!apiKey) {
    return { ok: false, error: "SMTP_PASS / SENDGRID_API_KEY not configured" };
  }

  try {
    const res = await fetch(`${host}/v3/mail/send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html",  value: html },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `SendGrid returned ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Unified dispatch ──────────────────────────────────────────────────────────

/**
 * Dispatches an alert to the appropriate channel based on rule.channel.
 * Never throws — returns a DeliveryResult so callers can update delivery_status.
 */
export async function dispatchAlert(payload: AlertPayload): Promise<DeliveryResult> {
  switch (payload.rule.channel) {
    case "slack":   return deliverSlack(payload);
    case "email":   return deliverEmail(payload);
    case "browser":
    default:        return deliverBrowser(payload);
  }
}
