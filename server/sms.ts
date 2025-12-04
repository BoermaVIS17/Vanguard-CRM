import Twilio from "twilio";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const ownerPhoneNumber = process.env.OWNER_PHONE_NUMBER;

let twilioClient: Twilio.Twilio | null = null;

if (accountSid && authToken) {
  twilioClient = Twilio(accountSid, authToken);
}

interface SMSNotificationParams {
  customerName: string;
  customerPhone: string;
  address: string;
  isPaid: boolean;
  amount?: number;
  promoCode?: string;
  salesRep?: string;
}

/**
 * Send SMS notification to owner for new report requests
 */
export async function sendSMSNotification(params: SMSNotificationParams): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber || !ownerPhoneNumber) {
    console.log("[SMS] Twilio not configured, skipping SMS notification");
    return false;
  }

  try {
    const paymentInfo = params.isPaid 
      ? `PAID $${((params.amount || 19900) / 100).toFixed(2)}`
      : `FREE (${params.promoCode || "N/A"})`;
    
    const repInfo = params.salesRep ? `\n👤 Rep: ${params.salesRep}` : "";

    const message = `🏠 NEW REPORT REQUEST
${params.customerName}
📍 ${params.address}
📞 ${params.customerPhone}
💰 ${paymentInfo}${repInfo}`;

    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: ownerPhoneNumber,
    });

    console.log("[SMS] Notification sent successfully");
    return true;
  } catch (error) {
    console.error("[SMS] Failed to send notification:", error);
    return false;
  }
}
