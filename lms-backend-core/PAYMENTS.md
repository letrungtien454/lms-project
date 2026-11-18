# VNPay integration setup

The payment API is enabled for the VNPay sandbox by default. Before starting the
backend, apply `src/main/resources/db/create_payment_orders.sql` to the configured
PostgreSQL database. Copy the VNPay variable names and defaults from the root
`.env.example` into the ignored root `.env` file. Spring Boot imports that file
when launched from either the repository root or `lms-backend-core`:

- `VNPAY_TMN_CODE`: merchant Terminal ID supplied by VNPay.
- `VNPAY_HASH_SECRET`: merchant signing secret supplied by VNPay.
- `VNPAY_PAY_URL`: optional; defaults to the VNPay sandbox payment URL.
- `VNPAY_RETURN_URL`: optional; defaults to
  `http://localhost:8080/payment/vnpay/return`. This must be a browser-reachable
  backend URL; use the public backend tunnel URL for sandbox testing.
- `FRONTEND_URL`: optional; defaults to `http://localhost:3000`. The backend
  returns the browser here after validating VNPay's signed response.

Configure the VNPay merchant IPN URL to
`https://<public-backend-host>/api/payments/vnpay/ipn`. The IPN endpoint must be
reachable by VNPay; `localhost` is not reachable from VNPay, so local sandbox
testing requires a secure public tunnel or deployed backend URL. Keep the hash
secret in environment configuration only; never place it in frontend code.

For local testing, set `VNPAY_RETURN_URL` to the browser-reachable backend
tunnel URL ending in `/payment/vnpay/return`, and set the VNPay IPN URL to the
same host ending in `/api/payments/vnpay/ipn`. Do not expose the database,
frontend, or any admin endpoint through the tunnel.

The browser return and IPN both verify the signed VNPay parameters, merchant,
and amount before recording the payment and creating the enrollment. The
frontend shows a brief success confirmation, then opens the purchased course.
