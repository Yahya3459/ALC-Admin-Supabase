import nodemailer from "nodemailer";

// يستخدم Gmail SMTP مع App Password
// يجب تعيين GMAIL_USER و GMAIL_APP_PASSWORD في البيئة
function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set — emails disabled");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export interface RegistrationEmailData {
  id: number;
  offerIndex: number;
  fullName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export async function sendRegistrationNotification(data: RegistrationEmailData): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const adminEmail = "z1xc20011019@gmail.com";

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Tahoma, Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0f5bb7, #1762c6); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 1.5rem; }
    .header p { margin: 8px 0 0; opacity: 0.85; font-size: 0.95rem; }
    .body { padding: 30px; }
    .badge { display: inline-block; background: #0f5bb7; color: white; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem; margin-bottom: 20px; }
    .field { margin-bottom: 16px; border-bottom: 1px solid #f0f0f0; padding-bottom: 16px; }
    .field:last-child { border-bottom: none; }
    .field label { display: block; font-size: 0.8rem; color: #888; margin-bottom: 4px; }
    .field value { font-size: 1rem; font-weight: 600; color: #333; }
    .footer { background: #f8f9fa; padding: 16px 30px; text-align: center; font-size: 0.8rem; color: #999; }
    .btn { display: inline-block; background: #0f5bb7; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 مركز الأمجاد للغات والتدريب</h1>
      <p>طلب تسجيل جديد في العروض</p>
    </div>
    <div class="body">
      <span class="badge">طلب رقم #${data.id}</span>
      <div class="field">
        <label>العرض المطلوب</label>
        <value>عرض رقم ${data.offerIndex}</value>
      </div>
      <div class="field">
        <label>الاسم الكامل</label>
        <value>${data.fullName}</value>
      </div>
      <div class="field">
        <label>رقم الهاتف</label>
        <value>${data.phone}</value>
      </div>
      <div class="field">
        <label>البريد الإلكتروني</label>
        <value>${data.email || "غير محدد"}</value>
      </div>
      ${data.notes ? `<div class="field"><label>ملاحظات</label><value>${data.notes}</value></div>` : ""}
      <div class="field">
        <label>وقت الطلب</label>
        <value>${new Date(data.createdAt).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })}</value>
      </div>
    </div>
    <div class="footer">
      مركز الأمجاد للغات والتدريب — نظام إدارة الطلبات
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"مركز الأمجاد" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `📩 طلب تسجيل جديد — ${data.fullName} (عرض رقم ${data.offerIndex})`,
      html,
    });
    console.log(`[Email] Notification sent for registration #${data.id}`);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send notification:", err);
    return false;
  }
}
