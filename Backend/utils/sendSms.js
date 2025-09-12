import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSms = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `Your BlueCarbon OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE, // Twilio number
      to: phone, // user’s phone number
    });

    console.log("✅ SMS sent successfully");
  } catch (error) {
    console.error("❌ SMS sending failed:", error.message);
  }
};
