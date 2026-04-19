// OTP Service Simulation (Easy to swap with Twilio/Firebase)
exports.sendOTP = async (phone, otp) => {
    console.log('-------------------------------------------');
    console.log(`[OTP SERVICE] Sending OTP ${otp} to ${phone}`);
    console.log('-------------------------------------------');
    // For real Twilio:
    // const client = require('twilio')(sid, auth);
    // await client.messages.create({ body: `Your HealCare OTP is ${otp}`, from: '+123', to: phone });
    return true;
};

exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
