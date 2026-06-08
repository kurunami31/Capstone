import nodemailer from 'nodemailer'

let transporter = null

async function ensureTransporter() {
  const host = process.env.SMTP_HOST
  if (!host) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, html }) {
  try {
    const t = await ensureTransporter()
    if (!t) return false
    const from = process.env.EMAIL_FROM || 'noreply@dorsu-recommender.com'
    await t.sendMail({ from, to, subject, html })
    return true
  } catch (err) {
    console.error('Email send error:', err)
    return false
  }
}

export async function notifyAssessmentCompleted(user, topPrograms) {
  const names = topPrograms.slice(0, 3).join(', ')
  return sendEmail({
    to: user.email,
    subject: 'Your DOrSU Program Recommendation is Ready',
    html: `<div style="font-family:sans-serif;max-width:500px">
      <h2 style="color:#1e3a5f">Assessment Complete</h2>
      <p>Hi ${user.firstName || user.name || 'Student'},</p>
      <p>Your program recommendation is ready! Your top matches include:</p>
      <p style="font-size:16px;font-weight:600;color:#2563eb">${names}</p>
      <p>Log in to view your full ranked list and download the PDF report.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0"/>
      <p style="font-size:12px;color:#94a3b8">DOrSU College Program Recommender System</p>
    </div>`,
  })
}

export async function notifyAccountCreated(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to DOrSU Recommender',
    html: `<div style="font-family:sans-serif;max-width:500px">
      <h2 style="color:#1e3a5f">Welcome!</h2>
      <p>Hi ${user.firstName || 'Student'},</p>
      <p>Your account has been created successfully. You can now log in and take the assessment to find your best-fit college programs at Davao Oriental State University.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0"/>
      <p style="font-size:12px;color:#94a3b8">DOrSU College Program Recommender System</p>
    </div>`,
  })
}

export async function notifySettingsChanged(changedByEmail, keys) {
  const admins = await pool.query("SELECT email FROM users WHERE role = 'admin'")
  for (const row of admins.rows) {
    if (row.email === changedByEmail) continue
    await sendEmail({
      to: row.email,
      subject: 'Settings Updated — DOrSU Recommender',
      html: `<div style="font-family:sans-serif;max-width:500px">
        <h2 style="color:#1e3a5f">Settings Updated</h2>
        <p>${changedByEmail} changed: ${keys.join(', ')}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0"/>
        <p style="font-size:12px;color:#94a3b8">DOrSU College Program Recommender System</p>
      </div>`,
    })
  }
}
