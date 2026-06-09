/**
 * Send a clean Hebrew test email through Resend so we can verify the new
 * Yarin-account key delivers properly to yarin@modaco.co.il. The earlier
 * curl test mangled the Hebrew because of bash UTF-8 escaping.
 */
async function main() {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer re_hHgjJ7iy_6HVrqPyWSdZq8FkWZChuT3eP",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      from: "Modaco <orders@modaco.co.il>",
      to: ["yarin@modaco.co.il"],
      subject: "✅ Resend מחובר לחשבון של ירין",
      html: `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"></head>
<body style="font-family: Heebo, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #0A0908; background: #FAF6F0;">
  <h1 style="font-size: 22px; margin: 0 0 16px;">המיגרציה הצליחה</h1>
  <p style="line-height: 1.7; font-size: 15px;">
    זה מייל בדיקה מהחשבון Resend החדש (תחת <strong>yarin@modaco.co.il</strong>).
  </p>
  <p style="line-height: 1.7; font-size: 15px;">
    מעכשיו כל מיילי המערכת של modaco.co.il יוצאים מהחשבון שלך — לא של עוז.
  </p>
  <p style="margin-top: 32px; color: #8B6F4E; font-size: 13px;">
    Modaco · מודקו<br>
    האומן 1, בית שמש
  </p>
</body>
</html>`,
      text:
        "המיגרציה הצליחה.\n\nזה מייל בדיקה מהחשבון Resend החדש (תחת yarin@modaco.co.il).\nמעכשיו כל מיילי המערכת של modaco.co.il יוצאים מהחשבון שלך — לא של עוז.\n\nModaco · מודקו",
    }),
  });
  const json = await resp.json();
  console.log(resp.status, JSON.stringify(json));
}
main();
