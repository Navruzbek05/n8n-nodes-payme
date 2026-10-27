# n8n-nodes-payme

[English](README.md) · [Русский](README.ru.md) · **O'zbekcha**

[Payme Business](https://payme.uz/) (O'zbekiston) uchun [n8n](https://n8n.io/) community-noda. Workflow ichida to'lov havolasini yaratadi, uni mijozga Telegram, SMS yoki elektron pochta orqali yuborishingiz mumkin.

> **Norasmiy loyiha.** Payme bilan bog'liq emas va u tomonidan tasdiqlanmagan. «Payme» o'z egasining tovar belgisidir.
>
> **Holati: dastlabki versiya (0.1.0).** Havola formati Payme rasmiy hujjatlariga asoslangan va testlar bilan tekshirilgan. Noda **haqiqiy Payme kassasida hali sinab ko'rilmagan.** Avval sandbox'da sinab ko'ring va muammolarni Issues bo'limida yozing.

[O'rnatish](#ornatish) · [Amallar](#amallar) · [Kirish ma'lumotlari](#kirish-malumotlari) · [Misol](#misol) · [Rejalar](#rejalar) · [Havolalar](#havolalar)

## O'rnatish

n8n'ning [community-nodalarni o'rnatish qo'llanmasiga](https://docs.n8n.io/integrations/community-nodes/installation/) amal qiling va `n8n-nodes-payme` paketini o'rnating.

> Paket hali npm'da yo'q. U e'lon qilinguncha qo'lda o'rnatish bo'yicha repozitoriyga qarang.

## Amallar

| Resurs | Amal | Nima qiladi |
|---|---|---|
| Checkout | Create Payment Link | Payme to'lov havolasini yaratadi. Lokal ishlaydi va Payme'ga hech narsa yubormaydi. |

Parametrlar:

- **Amount (UZS)**: so'mdagi summa. Payme talabiga ko'ra noda uni avtomatik tiyinga (×100) o'giradi.
- **Account Fields**: Payme veb-kassangizda sozlangan «Account» obyektining maydonlari, odatda `order_id`.
- **Options**: to'lov sahifasi tili (`ru`, `uz`, `en`), qaytish manzili, saytingizga qaytishdan oldingi kechikish.

Natija: `url` (to'lov havolasi) va `amountTiyin`.

### Payme Trigger (Merchant API)

Trigger-noda Payme sizning serveringizga yuboradigan so'rovlarni qabul qiladi (`CheckPerformTransaction`, `CreateTransaction`, `PerformTransaction`, `CancelTransaction`, `CheckTransaction`, `GetStatement`, `SetFiscalData`).

- Noda `Authorization` sarlavhasini (`Basic Paycom:<kassa kaliti>`) va JSON-RPC formatini o'zi tekshiradi. Noto'g'ri parol yoki buzilgan so'rovga Payme'ning kerakli xatosi bilan (`-32504`, `-32700`, `-32600`, `-32601`) javob beradi va workflow'ingizni **ishga tushirmaydi**.
- To'g'ri so'rov workflow'ni `id`, `method` va `params` maydonlari bilan ishga tushiradi (`params.amount` tiyinda).
- Payme'ga javobni sizning workflow'ingiz beradi. Oxirgi noda JSON-RPC javobini qaytarishi kerak, masalan `CheckPerformTransaction` uchun: `{ "id": {{ $json.id }}, "result": { "allow": true } }` yoki `{ "id": ..., "error": { "code": -31050, "message": { "ru": "...", "uz": "...", "en": "..." }, "data": "order_id" } }`. «Using Respond to Webhook Node» variantini ham tanlash mumkin.
- Payme `CreateTransaction`, `PerformTransaction` va `CancelTransaction` so'rovlarini **ikki marta** yuboradi va bir xil javob kutadi. Tranzaksiyalarni doimiy joyda (baza yoki jadval) saqlang va takroriy so'rovga undan javob bering.
- Payme `Content-Type: text/json` yuboradi, n8n uni o'qimaydi. Noda xom tanani o'zi o'qiydi, sizdan hech narsa talab qilinmaydi.
- Ushbu nodaning Production URL manzilini Payme Business'dagi kassangizning «Endpoint URL» maydoniga kiriting.

## Kirish ma'lumotlari

1. [Payme Business](https://developer.help.paycom.uz/) da biznes va veb-kassa ro'yxatdan o'tkazing (haqiqiy kassani faqat yuridik shaxslar ochadi).
2. n8n'da **Payme API** credential yarating va to'ldiring:
   - **Environment**: `Test (Sandbox)` yoki `Production`. Test muhitida havolalar `test.paycom.uz` da, ishchi muhitda `checkout.paycom.uz` da yaratiladi.
   - **Merchant ID**: veb-kassangiz ID'si.
   - **Cashbox Key**: faqat Payme Trigger uchun. Ishchi muhit: kassa kaliti. Test: sandbox'dagi `TEST_KEY`.

## Misol

Mijoz 5 000 so'mlik 197-buyurtmani rasmiylashtirdi.

1. **Payme** nodasini qo'shing, amal: **Create Payment Link**.
2. Amount: `5000`. Account Fields: nomi `order_id`, qiymati `197`.
3. Natija:

```json
{
  "url": "https://checkout.paycom.uz/bT01ODdm...",
  "amountTiyin": 500000
}
```

`url` ni mijozga Telegram, Email yoki SMS nodasi orqali yuboring.

## Moslik

n8n 2.25.7 da ishlab chiqilgan va ishga tushirilgan. Sizning n8n qo'llab-quvvatlaydigan Node.js versiyasi kerak.

## Rejalar

- Subscribe API orqali cheklar (yaratish, to'lash, tekshirish, bekor qilish)
- Tayyor workflow misollari (ma'lumotlar bazali to'liq Merchant API billing)
- Trigger-nodani Payme sandbox'ida (`test.paycom.uz`) tekshirish
- npm'da e'lon qilish

## Havolalar

- [Payme Business dasturchilar hujjatlari](https://developer.help.paycom.uz/)
- [n8n community-nodalar hujjatlari](https://docs.n8n.io/integrations/#community-nodes)

## Aloqa

Muallif: [Navruzbek05](https://github.com/Navruzbek05) · kemalkonroy@gmail.com

O'zbekistondagi bizneslar uchun n8n'da buyurtma asosida avtomatlashtirish qilaman.

## Litsenziya

[MIT](LICENSE.md)
