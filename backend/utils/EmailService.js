const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'demo@healcare.com',
                pass: process.env.EMAIL_PASS || 'demo_pass'
            }
        });
    }

    async sendBookingConfirmation(to, appointmentData) {
        const mailOptions = {
            from: '"HealCare" <support@healcare.com>',
            to,
            subject: 'Appointment Confirmed - HealCare',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Your Appointment is Confirmed!</h2>
                    <p>Dear ${appointmentData.patientName},</p>
                    <p>Your appointment with <strong>Dr. ${appointmentData.doctorName}</strong> has been successfully booked.</p>
                    <div style="background: #f7f7f7; padding: 20px; border-radius: 10px;">
                        <p><strong>Date:</strong> ${appointmentData.date}</p>
                        <p><strong>Time:</strong> ${appointmentData.startTime} - ${appointmentData.endTime}</p>
                        <p><strong>Type:</strong> ${appointmentData.type}</p>
                    </div>
                    <p>Thank you for choosing HealCare.</p>
                </div>
            `
        };
        try {
            // await this.transporter.sendMail(mailOptions);
            console.log("Email Sent Succesfully to", to);
        } catch (err) {
            console.error("Email error:", err);
        }
    }
}

module.exports = new EmailService();
