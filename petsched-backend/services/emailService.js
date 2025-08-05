const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send appointment confirmation
  async sendAppointmentConfirmation(appointment, pet, user) {
    const subject = `🐾 Appointment Confirmed - ${pet.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🐾 PetSched</h1>
          <p style="margin: 10px 0 0 0;">Appointment Confirmation</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">Your appointment has been confirmed for <strong>${pet.name}</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">📅 Appointment Details</h3>
            <p><strong>Pet:</strong> ${pet.name} (${pet.species})</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(appointment.date).toLocaleTimeString()}</p>
            <p><strong>Type:</strong> ${appointment.type}</p>
            <p><strong>Notes:</strong> ${appointment.notes || 'No additional notes'}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">Please arrive 10 minutes before your scheduled appointment time.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Appointment
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #666; font-size: 14px;">
            <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
            <p>Thank you for choosing PetSched!</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Send appointment reminder
  async sendAppointmentReminder(appointment, pet, user) {
    const subject = `🐾 Appointment Reminder - ${pet.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🐾 PetSched</h1>
          <p style="margin: 10px 0 0 0;">Appointment Reminder</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">This is a friendly reminder about your upcoming appointment for <strong>${pet.name}</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">📅 Appointment Details</h3>
            <p><strong>Pet:</strong> ${pet.name} (${pet.species})</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(appointment.date).toLocaleTimeString()}</p>
            <p><strong>Type:</strong> ${appointment.type}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">Please arrive 10 minutes before your scheduled appointment time.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Appointment
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #666; font-size: 14px;">
            <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
            <p>Thank you for choosing PetSched!</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const subject = '🐾 Welcome to PetSched!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🐾 PetSched</h1>
          <p style="margin: 10px 0 0 0;">Welcome to the Family!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">Welcome to PetSched! We're excited to help you manage your pet's healthcare appointments.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">🚀 Getting Started</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Add your pets to your profile</li>
              <li>Schedule appointments with ease</li>
              <li>Receive reminders and confirmations</li>
              <li>Track your pet's health history</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #666; font-size: 14px;">
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Thank you for choosing PetSched!</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Generic email sender
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService(); 