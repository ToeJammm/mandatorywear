import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { isAdminAuthenticated } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [signups, settings] = await Promise.all([
    prisma.emailSignup.findMany(),
    prisma.settings.findUnique({ where: { id: "main" } }),
  ]);

  if (signups.length === 0) {
    return NextResponse.json({ error: "No subscribers." }, { status: 400 });
  }

  const resend = getResend();
  const siteUrl = process.env.NEXT_PUBLIC_URL ?? "https://mandatorywear.com";
  const subject = settings?.emailSubject || "THE DROP IS LIVE";
  const bodyText = settings?.emailBody || "Limited quantity. First come, first served.";

  const { error } = await resend.batch.send(
    signups.map((s) => ({
      from: `Mandatory Wear <drops@mandatorywear.com>`,
      to: s.email,
      subject,
      html: dropEmail(siteUrl, bodyText),
    }))
  );

  if (error) {
    return NextResponse.json({ error: "Failed to send emails." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: signups.length });
}

function dropEmail(siteUrl: string, bodyText: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#000000;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;min-height:100vh;">
    <tr>
      <td align="center" style="padding:60px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <tr>
            <td align="center" style="padding-bottom:48px;">
              <img
                src="${siteUrl}/logo-cropped.jpg"
                alt="Mandatory Wear"
                width="280"
                style="width:280px;filter:invert(1);"
              />
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom:16px;">
              <p style="margin:0;color:#4b5320;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;">
                ★ &nbsp; New Drop &nbsp; ★
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;color:#f4f1eb;font-size:14px;letter-spacing:0.05em;line-height:1.9;white-space:pre-line;">
                ${bodyText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom:48px;">
              <a
                href="${siteUrl}"
                style="display:inline-block;background:#4b5320;color:#f4f1eb;text-decoration:none;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;padding:16px 40px;"
              >
                Shop Now
              </a>
            </td>
          </tr>

          <tr>
            <td align="center">
              <p style="margin:0;color:#f4f1eb;opacity:0.2;font-size:11px;letter-spacing:0.2em;">
                MANDATORY WEAR
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
