# IPT 2026 Backend

Node.js + MySQL backend API for the IPT 2026 final project.

## Live Links

- API: To be added after Railway deployment
- API Docs: To be added after Railway deployment

## Tech Stack

- Node.js
- Express
- MySQL
- JWT
- Refresh token cookies
- Resend
- Swagger

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill in your local values.

3. Create the database:

```sql
CREATE DATABASE ipt_2026;
```

4. Run the schema:

```bash
mysql -u root -p ipt_2026 < database/schema.sql
```

5. Start the server:

```bash
npm run dev
```

6. Open:

```text
http://localhost:4000
http://localhost:4000/api-docs
```

## Environment Variables

See `.env.example`.

## Email Setup

This project sends verification and password reset emails with Resend.

Required variables:

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=no-reply@your-verified-domain.com
FRONTEND_URL=https://your-frontend-url
CORS_ORIGIN=https://your-frontend-url
```

The backend sends verification email to the same email address used during registration. It does not redirect messages to a personal Gmail address and does not hardcode recipients.

Resend testing mode only allows sending to your own verified/test email. To send verification emails to arbitrary users, verify a sending domain in Resend, then set `EMAIL_FROM` to an address on that domain, for example `no-reply@myverifieddomain.com`.

## Notes

- Do not commit `.env`.
- The first registered account can be used as the Admin account.
- The frontend must set its production API URL to this backend after deployment.


## Live Links

- API: https://ipt-2026-backend-production.up.railway.app
- API Docs: https://ipt-2026-backend-production.up.railway.app/api-docs
