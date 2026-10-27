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

## Kirish ma'lumotlari

1. [Payme Business](https://developer.help.paycom.uz/) da biznes va veb-kassa ro'yxatdan o'tkazing (haqiqiy kassani faqat yuridik shaxslar ochadi).
2. n8n'da **Payme API** credential yarating va to'ldiring:
   - **Environment**: `Test (Sandbox)` yoki `Production`. Test muhitida havolalar `test.paycom.uz` da, ishchi muhitda `checkout.paycom.uz` da yaratiladi.
   - **Merchant ID**: veb-kassangiz ID'si.

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
- Merchant API uchun Trigger-noda (Payme sizning serveringizga yuboradigan so'rovlar)
- Tayyor workflow misollari
- npm'da e'lon qilish

## Havolalar

- [Payme Business dasturchilar hujjatlari](https://developer.help.paycom.uz/)
- [n8n community-nodalar hujjatlari](https://docs.n8n.io/integrations/#community-nodes)

## Aloqa

Muallif: [Navruzbek05](https://github.com/Navruzbek05) · kemalkonroy@gmail.com

O'zbekistondagi bizneslar uchun n8n'da buyurtma asosida avtomatlashtirish qilaman.

## Litsenziya

[MIT](LICENSE.md)
