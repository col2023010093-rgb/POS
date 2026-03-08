/**
 * emailService.js  —  Texas Joe's House of Ribs
 * ─────────────────────────────────────────────────────────────────────
 * FIX: Resend is now lazy-initialised inside getResend() instead of
 * at module load time. The old pattern:
 *
 *   const resend = new Resend(process.env.RESEND_API_KEY);  // ← crashes
 *
 * threw "Missing API key" because the module was required before
 * dotenv had populated process.env (or RESEND_API_KEY simply isn't
 * set in the local .env file yet).
 *
 * New behaviour by environment:
 * ──────────────────────────────────────────────────────────────────────
 * LOCAL DEV (NODE_ENV=development OR key missing):
 *   Emails are skipped. The 6-digit code is printed to the terminal
 *   instead so you can copy-paste it during testing. Server starts fine.
 *
 * PRODUCTION (NODE_ENV=production, key must be present):
 *   If RESEND_API_KEY is missing the first email attempt throws clearly.
 *
 * Local .env setup  (pos-backend/.env):
 *   RESEND_API_KEY=re_xxxxxxxxxxxxxxxx    ← from resend.com/api-keys
 *   EMAIL_FROM=noreply@texasjoes.site
 *   NODE_ENV=development
 * ─────────────────────────────────────────────────────────────────────
 */

'use strict';

const { Resend } = require('resend');

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const IS_DEV     = process.env.NODE_ENV !== 'production';

/**
 * Lazy Resend getter — called only when an email is actually being sent,
 * not at require() time. Returns null in dev when no key is configured.
 */
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (IS_DEV) return null;   // dev: skip email, log code to console
    throw new Error(
      '[emailService] RESEND_API_KEY is not set. ' +
      'Add it to your .env file or Render environment variables.'
    );
  }
  return new Resend(key);
}

/**
 * Internal send helper.
 * In dev with no key: logs subject + recipient, skips the actual send.
 */
async function sendEmail({ to, subject, html }) {
  const client = getResend();
  if (!client) {
    console.log(`\n📧 [DEV — email skipped, no RESEND_API_KEY set]`);
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}\n`);
    return;
  }
  await client.emails.send({ from: FROM_EMAIL, to, subject, html });
}

// ─────────────────────────────────────────────────────────────────────
// Email templates
// ─────────────────────────────────────────────────────────────────────

/**
 * sendVerificationEmail
 * Sends (or logs in dev) a 6-digit account verification code.
 */
const sendVerificationEmail = async (email, code) => {
  try {
    await sendEmail({
      to      : email,
      subject : "Verify Your Email — Texas Joe's House of Ribs",
      html    : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#8B4513;">Welcome to Texas Joe's! 🤠</h2>
          <p>Thanks for signing up! Use the code below to verify your email address.</p>
          <div style="background:#fdf6ec;border:1px solid #d4bfa8;border-radius:12px;
                      padding:24px;text-align:center;margin:24px 0;">
            <p style="font-size:13px;color:#7a5c2e;margin-bottom:8px;">Your verification code:</p>
            <h1 style="color:#8B4513;font-size:48px;letter-spacing:14px;
                        margin:8px 0;font-family:monospace;">${code}</h1>
            <p style="font-size:12px;color:#aaa;margin-top:8px;">
              Expires in 15 minutes &middot; Single use
            </p>
          </div>
          <p style="color:#666;font-size:13px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          <p style="margin-top:24px;">Saddle up,<br><strong>Texas Joe's Team</strong></p>
        </div>`,
    });

    // Always log the code in dev so you can test without a real email
    if (IS_DEV) {
      console.log(`🔑 [DEV] Verification code for ${email}: ${code}`);
    } else {
      console.log(`✅ Verification email sent to ${email}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Verification email failed:', error);
    throw error;
  }
};

/**
 * sendPasswordResetEmail
 * Sends (or logs in dev) a 6-digit password reset code.
 */
const sendPasswordResetEmail = async (email, code) => {
  try {
    await sendEmail({
      to      : email,
      subject : "Password Reset Code — Texas Joe's House of Ribs",
      html    : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#8B4513;">Password Reset Request 🔑</h2>
          <p>We received a request to reset your password.</p>
          <div style="background:#fdf6ec;border:1px solid #d4bfa8;border-radius:12px;
                      padding:24px;text-align:center;margin:24px 0;">
            <p style="font-size:13px;color:#7a5c2e;margin-bottom:8px;">Your reset code:</p>
            <h1 style="color:#8B4513;font-size:48px;letter-spacing:14px;
                        margin:8px 0;font-family:monospace;">${code}</h1>
            <p style="font-size:12px;color:#aaa;margin-top:8px;">
              Expires in 15 minutes &middot; Single use
            </p>
          </div>
          <p style="color:#666;font-size:13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="margin-top:24px;">Stay safe,<br><strong>Texas Joe's Team</strong></p>
        </div>`,
    });

    if (IS_DEV) {
      console.log(`🔑 [DEV] Password reset code for ${email}: ${code}`);
    } else {
      console.log(`✅ Password reset email sent to ${email}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    throw error;
  }
};

/**
 * sendOrderConfirmation
 */
const sendOrderConfirmation = async (order, user) => {
  const itemsList = (order.items || [])
    .map(item => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity}x ${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
          ₱${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>`)
    .join('');

  try {
    await sendEmail({
      to      : user.email,
      subject : `Order Confirmation — ${order.orderNumber}`,
      html    : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#8B4513;">Order Confirmed! 🍖</h2>
          <p>Hi ${user.firstName},</p>
          <p>Thanks for your order. We'll start preparing it shortly.</p>
          <div style="background:#fdf6ec;padding:15px;border-radius:8px;margin:20px 0;">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> ₱${Number(order.totalAmount).toFixed(2)}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;">${itemsList}</table>
          <p style="margin-top:20px;">We'll notify you when your order status changes.</p>
          <p>Best regards,<br><strong>Texas Joe's Team</strong></p>
        </div>`,
    });
    console.log(`✅ Order confirmation sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Order confirmation email failed:', error);
    // Don't re-throw — failed confirmation shouldn't break the order
  }
};

/**
 * sendOrderStatusUpdate
 */
const sendOrderStatusUpdate = async (order, user) => {
  try {
    await sendEmail({
      to      : user.email,
      subject : `Order Update — ${order.orderNumber}`,
      html    : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#8B4513;">Order Status Updated</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your order status has been updated.</p>
          <div style="background:#fdf6ec;padding:15px;border-radius:8px;margin:20px 0;">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>New Status:</strong>
              <span style="color:#4caf50;font-weight:bold;">
                ${order.status.toUpperCase()}
              </span>
            </p>
          </div>
          ${order.status === 'ready'
            ? '<p style="color:#4caf50;font-weight:bold;">🎉 Your order is ready!</p>'
            : ''}
          <p>Best regards,<br><strong>Texas Joe's Team</strong></p>
        </div>`,
    });
    console.log(`✅ Status update email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Status update email failed:', error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
};