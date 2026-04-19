const nodemailer = require('nodemailer');

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

exports.sendResetPasswordEmail = async (email, otp) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('EMAIL NOT CONFIGURED');
            console.log(`[DEV MODE] Reset OTP: ${otp}`);
            return true;
        }

        const mailOptions = {
            from: `"HealCare Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - HealCare',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2563eb; text-align: center;">HealCare Security</h2>
                    <p>Hello,</p>
                    <p>Your password reset OTP is:</p>

                    <div style="background:#f1f5f9; padding:20px; text-align:center; border-radius:10px; font-size:28px; font-weight:800; letter-spacing:8px; color:#1e293b;">
                        ${otp}
                    </div>

                    <p style="text-align:center; color:#64748b; font-size:13px;">
                        This OTP is valid for 10 minutes. Do not share it with anyone.
                    </p>
                </div>
            `
        };

        await getTransporter().sendMail(mailOptions);
        return true;

    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

exports.sendBookingConfirmation = async (email, data) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[DEV MODE] Booking Email for ${email}`);
            return true;
        }

        const mailOptions = {
            from: `"HealCare" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Appointment Confirmed - HealCare',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #16a34a; text-align: center;">Booking Confirmed!</h2>

                    <p>Hello <strong>${data.patientName || 'Patient'}</strong>,</p>

                    <p>Your appointment with <strong>Dr. ${data.doctorName || 'Doctor'}</strong> is confirmed.</p>

                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px;">
                        <p><strong>Date:</strong> ${data.date}</p>
                        <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
                        <p><strong>Type:</strong> ${data.type}</p>
                    </div>

                    ${data.meetingLink ? `<p><a href="${data.meetingLink}">Join Meeting</a></p>` : ''}
                </div>
            `
        };

        await getTransporter().sendMail(mailOptions);
        return true;

    } catch (error) {
        console.error('Email confirmation error:', error);
        return false;
    }
};