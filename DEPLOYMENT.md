# Deployment Configuration

The backend default profile is production-safe and requires environment variables. Do not deploy the local `dev` profile.

## Frontend

Set `VITE_API_BASE_URL` to the deployed backend API before running `npm run build`:

```text
VITE_API_BASE_URL=https://api.example.com/api
```

For same-origin hosting, use `/api` and route `/api` to the backend at the hosting layer.

## Backend

Copy `warehouse_backend/.env.example` into your hosting provider's environment settings. Required values include:

- `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` for the production MySQL instance
- `JWT_SECRET` with at least 32 random bytes
- `FRONTEND_URL` and `CORS_ORIGINS` for the deployed frontend origin
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, and `MAIL_PASSWORD` for password reset email
- `FILE_UPLOAD_DIR` pointing to a persistent volume, or a mounted object-storage filesystem

The production defaults use `ddl-auto=validate`, disable SQL logging, and disable admin seeding. Run database migrations separately before starting the application.

For the migrated Aiven MySQL database, use these values in the backend hosting platform:

```text
DB_URL=jdbc:mysql://warehousemysql-venkat2026.aivencloud.com:21805/warehousedb?sslMode=REQUIRED
DB_USERNAME=avnadmin
DB_PASSWORD=<Aiven password stored as a hosting secret>
```

`sslMode=REQUIRED` ensures the JDBC connection uses TLS. Keep the Aiven password only in the hosting provider's secret/environment settings.

To create the first administrator, temporarily set `SEED_ADMIN=true` together with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in a protected deployment, start once, then disable seeding and rotate the password.

## Remaining hosting choice

Uploaded product and delivery files currently use the configured filesystem directory. A persistent volume prevents loss on restart; fully managed object storage requires an adapter for the provider you select (for example, Azure Blob Storage or Amazon S3).

## Local development

Run the backend with the local profile:

```powershell
cd warehouse_backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

Run the frontend with `npm run dev`.