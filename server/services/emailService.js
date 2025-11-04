// services/emailService.js
import nodemailer from 'nodemailer'

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  async sendEmail(to, subject, html) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
      return info
    } catch (error) {
      console.error('Failed to send email:', {
        to,
        subject,
        error: error.message,
        code: error.code, // e.g., 'EAUTH', 'ECONNECTION'
      })
      // DO NOT THROW HERE for non-critical emails
      return null // or { success: false, error }
    }
  }

  async sendWelcomeEmail(to, name) {
    const subject = 'Welcome to ShopCo!'
    const html = `
      <h1>Welcome to ShopCo, ${name}!</h1>
      <p>Thank you for registering with us. We're excited to have you on board.</p>
      <p>Start shopping now and enjoy exclusive deals!</p>
      <a href="${process.env.CLIENT_URL}/shop" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
    `

    await this.sendEmail(to, subject, html)
  }

  async sendOrderConfirmation(to, name, order) {
    const subject = `Order Confirmation - ${order.orderNumber}`
    const html = `
      <h1>Order Confirmed!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your order. Here are your order details:</p>

      <h2>Order Summary</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Total Amount:</strong> $${order.pricing.totalPrice}</p>
      <p><strong>Shipping Address:</strong> ${order.shippingAddress.street}, ${
      order.shippingAddress.city
    }</p>

      <h3>Items Ordered:</h3>
      <ul>
        ${order.items
          .map(
            (item) => `
          <li>${item.name} - $${item.price} x ${item.quantity}</li>
        `
          )
          .join('')}
      </ul>

      <p>We'll notify you when your order ships.</p>
      <a href="${process.env.CLIENT_URL}/orders/${
      order._id
    }" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
    `

    await this.sendEmail(to, subject, html)
  }

  async sendPasswordResetEmail(to, name, resetUrl) {
    const subject = 'Password Reset Request'
    const html = `
      <h1>Password Reset</h1>
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `

    await this.sendEmail(to, subject, html)
  }

  async sendOrderStatusUpdate(to, name, order, newStatus) {
    const subject = `Order Status Update - ${order.orderNumber}`
    const html = `
      <h1>Order Status Updated</h1>
      <p>Hi ${name},</p>
      <p>Your order ${order.orderNumber} status has been updated to: <strong>${newStatus}</strong></p>

      <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
    `

    await this.sendEmail(to, subject, html)
  }
}

export default new EmailService()
