const WHATSAPP_TOKEN = import.meta.env.VITE_WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_ID;
const API_VERSION = 'v19.0';

/**
 * Uploads a PDF Blob to Meta's WhatsApp API and returns a Media ID
 */
export async function uploadInvoiceToMeta(pdfBlob) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API keys are missing in .env.local');
  }

  const formData = new FormData();
  formData.append('file', pdfBlob, 'invoice.pdf');
  formData.append('type', 'document');
  formData.append('messaging_product', 'whatsapp');

  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/media`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      // Note: Do not set 'Content-Type' when using FormData, the browser handles the boundary
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to upload media to WhatsApp');
  }

  return data.id; // Returns the media_id string
}

/**
 * Sends a WhatsApp message with the uploaded Media ID attached
 */
export async function sendInvoiceMessage(studentPhone, mediaId) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API keys are missing in .env.local');
  }

  // Ensure phone number has country code (assuming India +91 if missing for demo purposes)
  let formattedPhone = studentPhone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'document',
    document: {
      id: mediaId,
      caption: 'Hello! Here is your latest tuition invoice.'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to send WhatsApp message');
  }

  return data;
}
