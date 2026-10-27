# n8n-nodes-payme

**English** · [Русский](README.ru.md) · [O'zbekcha](README.uz.md)

An [n8n](https://n8n.io/) community node for [Payme Business](https://payme.uz/) (Uzbekistan). Build a payment link from a workflow and send it to your customer in Telegram, SMS or e-mail.

> **Unofficial project.** It is not affiliated with or endorsed by Payme. "Payme" is a trademark of its owner.
>
> **Status: early (0.1.0).** The link format follows the official Payme documentation and is covered by unit tests. It has **not yet been tested against a live Payme cashbox**. Please try it in the sandbox first and report problems in the issues.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Usage](#usage) · [Roadmap](#roadmap) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) and install the package `n8n-nodes-payme`.

> The package is not on npm yet. Until then, see the repository for manual installation.

## Operations

| Resource | Operation | What it does |
|---|---|---|
| Checkout | Create Payment Link | Builds a Payme checkout URL. It works locally and sends nothing to Payme. |

Inputs:

- **Amount (UZS)**: the amount in so'm. The node converts it to tiyin (×100) as Payme requires.
- **Account Fields**: the fields of the "Account" object configured in your Payme web cashbox, usually `order_id`.
- **Options**: language of the payment page (`ru`, `uz`, `en`), return URL, delay before returning to your site.

Output: `url` (the payment link) and `amountTiyin`.

## Credentials

1. Register a business and a web cashbox in [Payme Business](https://developer.help.paycom.uz/) (only registered legal entities can open a production cashbox).
2. In n8n create the credential **Payme API** and fill in:
   - **Environment**: `Test (Sandbox)` or `Production`. The test environment builds links on `test.paycom.uz`, production on `checkout.paycom.uz`.
   - **Merchant ID**: the ID of your web cashbox.

## Usage

Example: a customer places order 197 for 5 000 so'm.

1. Add the **Payme** node, operation **Create Payment Link**.
2. Amount: `5000`. Account Fields: name `order_id`, value `197`.
3. The output looks like:

```json
{
  "url": "https://checkout.paycom.uz/bT01ODdm...",
  "amountTiyin": 500000
}
```

Send `url` to the customer with a Telegram, Email or SMS node.

## Compatibility

Developed and run on n8n 2.25.7. Requires a Node.js version supported by your n8n.

## Roadmap

- Receipts through the Subscribe API (create, pay, check, cancel)
- A trigger node for the Merchant API (the calls Payme sends to your server)
- Ready-made example workflows
- Publishing to npm

## Resources

- [Payme Business developer docs](https://developer.help.paycom.uz/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## Contact

Author: [Navruzbek05](https://github.com/Navruzbek05) · kemalkonroy@gmail.com

Open to custom n8n automations for businesses in Uzbekistan.

## License

[MIT](LICENSE.md)
