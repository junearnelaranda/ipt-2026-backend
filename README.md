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
- Nodemailer
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

## Notes

- Do not commit `.env`.
- The first registered account can be used as the Admin account.
- The frontend must set its production API URL to this backend after deployment.


## Live Links

- API: https://ipt-2026-backend-production.up.railway.app
- API Docs: https://ipt-2026-backend-production.up.railway.app/api-docs