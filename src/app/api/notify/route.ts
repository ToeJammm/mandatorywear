import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { isAdminAuthenticated } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signups = await prisma.emailSignup.findMany();
  if (signups.length === 0) {
    return NextResponse.json({ error: "No subscribers." }, { status: 400 });
  }

  const resend = getResend();
  const siteUrl = process.env.NEXT_PUBLIC_URL ?? "https://mandatorywear.com";

  const { error } = await resend.batch.send(
    signups.map((s) => ({
      from: `Mandatory Wear <drops@mandatorywear.com>`,
      to: s.email,
      subject: "THE DROP IS LIVE",
      html: dropEmail(siteUrl),
    }))
  );

  if (error) {
    return NextResponse.json({ error: "Failed to send emails." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: signups.length });
}

function dropEmail(siteUrl: string): string {
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
                src="${siteUrl}/logo.jpg"
                alt="Mandatory Wear"
                width="240"
                style="width:240px;filter:invert(1);"
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
            <td align="center" style="padding-bottom:48px;">
              <h1 style="margin:0;color:#f4f1eb;font-size:32px;letter-spacing:0.1em;text-transform:uppercase;">
                THE DROP IS LIVE
              </h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom:48px;">
              <p style="margin:0;color:#f4f1eb;opacity:0.5;font-size:14px;letter-spacing:0.05em;line-height:1.8;">
                Limited quantity. First come, first served.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center">
              <a
                href="${siteUrl}"
                style="display:inline-block;background:#4b5320;color:#f4f1eb;text-decoration:none;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;padding:16px 40px;"
              >
                Shop Now
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:60px;">
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
