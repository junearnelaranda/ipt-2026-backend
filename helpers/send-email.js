const { Resend } = require('resend');

const EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_TIMEOUT_MS || 15000);

function withTimeout(promise, timeoutMs) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Email provider timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!to || !subject || !html) {
    throw new Error('Email to, subject, and html are required');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  const { data, error } = await withTimeout(
    resend.emails.send({
      from,
      to,
      subject,
      html
    }),
    EMAIL_TIMEOUT_MS
  );

  if (error) {
    throw new Error(error.message || 'Failed to send email with Resend');
  }

  return data;
}

module.exports = sendEmail;
