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
  `http://localhost:3000/payment/vnpay/return`.

Configure the VNPay merchant IPN URL to
`https://<public-backend-host>/api/payments/vnpay/ipn`. The IPN endpoint must be
reachable by VNPay; `localhost` is not reachable from VNPay, so local sandbox
testing requires a secure public tunnel or deployed backend URL. Keep the hash
secret in environment configuration only; never place it in frontend code.

For local testing, set `VNPAY_RETURN_URL` to the browser-reachable frontend URL
and use a secure tunnel for the backend IPN endpoint. Configure the exact
tunnel URL in the VNPay sandbox merchant portal. Do not expose the database,
frontend, or any admin endpoint through the tunnel.

A successful browser return does not by itself grant course access. The backend
verifies the signed VNPay IPN, checks the merchant and amount against the saved
payment order, and then creates the enrollment. The return page polls the
authenticated order-status API while the IPN is being processed.
