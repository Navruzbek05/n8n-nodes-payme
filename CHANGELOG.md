# Changelog

## 0.2.1

- New node and credential icon in the Payme style (light and dark variants).

## 0.2.0

- Payme Trigger node for the Merchant API: checks the Basic auth key and the JSON-RPC envelope, answers Payme errors (-32504, -32700, -32600, -32601) itself, starts the workflow for valid calls. Reads the raw body because Payme sends `text/json`.
- Payme API credential: new optional field Cashbox Key.

## 0.1.0

- First release: Payme API credentials (test/production, merchant ID).
- Checkout resource, operation Create Payment Link (Payme GET checkout URL, amount in so'm converted to tiyin).
