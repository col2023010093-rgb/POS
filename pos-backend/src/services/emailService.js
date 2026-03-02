const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOrderConfirmation = async (order, user) => {
  const itemsList = order.items.map(item => 
    `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
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

        <div style="background: #fff; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
          <h4>Items:</h4>
          <pre style="font-family: monospace;">${itemsList}</pre>
        </div>

        <p style="margin-top: 20px;">We'll notify you when your order status changes.</p>
        <p>Best regards,<br>POS Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Email send failed:', error);
  }
};

const sendOrderStatusUpdate = async (order, user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Update - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">Order Status Updated</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your order status has been updated.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>New Status:</strong> <span style="color: #4caf50; font-weight: bold;">${order.status.toUpperCase()}</span></p>
        </div>

        ${order.status === 'ready' ? '<p style="color: #4caf50; font-weight: bold;">🎉 Your order is ready for pickup!</p>' : ''}
        
        <p>Best regards,<br>POS Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Email send failed:', error);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate
};