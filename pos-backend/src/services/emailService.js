const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Use your verified domain, or use onboarding@resend.dev for testing
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// ✅ Email verification
const sendVerificationEmail = async (email, code) => {
  try {
    await resend.emails.send({
      from    : FROM_EMAIL,
      to      : email,
      subject : "Verify Your Email - Texas Joe's House of Ribs",
      html    : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff6b35;">Welcome to Texas Joe's!</h2>
          <p>Thank you for creating an account. Please verify your email address to get started.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your verification code is:</p>
            <h1 style="color: #d32f2f; font-size: 42px; letter-spacing: 12px; margin: 10px 0; font-family: monospace;">${code}</h1>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">This code expires in 10 minutes</p>
          </div>

          <p style="color: #666; font-size: 14px;">If you didn't create this account, please ignore this email.</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>Texas Joe's Team</strong></p>
        </div>
      `
    });
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Verification email failed:', error);
    throw error;
  }
};

// ✅ Order confirmation
const sendOrderConfirmation = async (order, user) => {
  const itemsList = order.items
    .map(item => `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}x ${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₱${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`)
    .join('');

  try {
    await resend.emails.send({
      from    : FROM_EMAIL,
      to      : user.email,
      subject : `Order Confirmation - ${order.orderNumber}`,
      html    : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">Order Confirmed!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Thank you for your order. We've received it and will start preparing shortly.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> ₱${order.totalAmount.toFixed(2)}</p>
          </div>

          <div style="background: #fff; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <h4 style="padding: 12px 15px; margin: 0; background: #f5f5f5;">Items</h4>
            <table style="width: 100%; border-collapse: collapse; padding: 15px;">
              ${itemsList}
            </table>
          </div>

          <p style="margin-top: 20px;">We'll notify you when your order status changes.</p>
          <p>Best regards,<br><strong>Texas Joe's Team</strong></p>
        </div>
      `
    });
    console.log(`✅ Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Order confirmation email failed:', error);
  }
};

// ✅ Order status update
const sendOrderStatusUpdate = async (order, user) => {
  try {
    await resend.emails.send({
      from    : FROM_EMAIL,
      to      : user.email,
      subject : `Order Update - ${order.orderNumber}`,
      html    : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">Order Status Updated</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your order status has been updated.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>New Status:</strong> 
              <span style="color: #4caf50; font-weight: bold;">${order.status.toUpperCase()}</span>
            </p>
          </div>

          ${order.status === 'ready'
            ? '<p style="color: #4caf50; font-weight: bold;">🎉 Your order is ready for pickup!</p>'
            : ''}

          <p>Best regards,<br><strong>Texas Joe's Team</strong></p>
        </div>
      `
    });
    console.log(`✅ Status update email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Status update email failed:', error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPasswordResetEmail
};