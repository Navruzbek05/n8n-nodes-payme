# n8n-nodes-payme

[English](README.md) · **Русский** · [O'zbekcha](README.uz.md)

Community-нода [n8n](https://n8n.io/) для [Payme Business](https://payme.uz/) (Узбекистан). Создаёт ссылку на оплату прямо в workflow, чтобы отправить её клиенту в Telegram, по SMS или на почту.

> **Неофициальный проект.** Не связан с Payme и не одобрен им. «Payme» является товарным знаком своего владельца.
>
> **Статус: ранняя версия (0.1.0).** Формат ссылки взят из официальной документации Payme и покрыт тестами. **На боевой кассе Payme нода ещё не проверялась.** Сначала попробуйте её в песочнице и сообщайте о проблемах в Issues.

[Установка](#установка) · [Операции](#операции) · [Учётные данные](#учётные-данные) · [Пример](#пример) · [Планы](#планы) · [Ссылки](#ссылки)

## Установка

Следуйте [инструкции n8n по установке community-нод](https://docs.n8n.io/integrations/community-nodes/installation/) и установите пакет `n8n-nodes-payme`.

> Пакета в npm пока нет. До публикации смотрите ручную установку в репозитории.

## Операции

| Ресурс | Операция | Что делает |
|---|---|---|
| Checkout | Create Payment Link | Собирает ссылку на оплату Payme. Работает локально и ничего не отправляет в Payme. |

Параметры:

- **Amount (UZS)**: сумма в сумах. Нода сама переводит её в тийины (×100), как требует Payme.
- **Account Fields**: поля объекта «Account», настроенные в вашей веб-кассе Payme, обычно `order_id`.
- **Options**: язык страницы оплаты (`ru`, `uz`, `en`), адрес возврата, задержка перед возвратом на ваш сайт.

Результат: `url` (ссылка на оплату) и `amountTiyin`.

### Payme Trigger (Merchant API)

Trigger-нода принимает запросы, которые Payme шлёт на ваш сервер (`CheckPerformTransaction`, `CreateTransaction`, `PerformTransaction`, `CancelTransaction`, `CheckTransaction`, `GetStatement`, `SetFiscalData`).

- Нода сама проверяет заголовок `Authorization` (`Basic Paycom:<ключ кассы>`) и формат JSON-RPC. На неверный пароль или битый запрос она отвечает нужной ошибкой Payme (`-32504`, `-32700`, `-32600`, `-32601`) и **не запускает ваш workflow**.
- Корректный запрос запускает workflow с полями `id`, `method` и `params` (`params.amount` в тийинах).
- Ответ Payme формирует ваш workflow. Последняя нода должна вернуть JSON-RPC ответ, например для `CheckPerformTransaction`: `{ "id": {{ $json.id }}, "result": { "allow": true } }` или `{ "id": ..., "error": { "code": -31050, "message": { "ru": "...", "uz": "...", "en": "..." }, "data": "order_id" } }`. Можно выбрать и вариант «Using Respond to Webhook Node».
- Payme шлёт `CreateTransaction`, `PerformTransaction` и `CancelTransaction` **дважды** и ждёт одинаковый ответ. Храните транзакции в постоянном месте (база или таблица) и на повторный вызов отвечайте из неё.
- Payme присылает `Content-Type: text/json`, который n8n не разбирает. Нода читает «сырое» тело сама, вам ничего делать не нужно.
- Production URL этой ноды укажите как «Endpoint URL» вашей кассы в Payme Business.

## Учётные данные

1. Зарегистрируйте бизнес и веб-кассу в [Payme Business](https://developer.help.paycom.uz/) (боевую кассу открывают только юридические лица).
2. В n8n создайте учётные данные **Payme API** и заполните:
   - **Environment**: `Test (Sandbox)` или `Production`. Тест строит ссылки на `test.paycom.uz`, боевая среда на `checkout.paycom.uz`.
   - **Merchant ID**: ID вашей веб-кассы.
   - **Cashbox Key**: нужен только для Payme Trigger. Боевая среда: ключ кассы. Тест: `TEST_KEY` из песочницы.

## Пример

Клиент оформил заказ 197 на 5 000 сум.

1. Добавьте ноду **Payme**, операция **Create Payment Link**.
2. Amount: `5000`. Account Fields: имя `order_id`, значение `197`.
3. На выходе:

```json
{
  "url": "https://checkout.paycom.uz/bT01ODdm...",
  "amountTiyin": 500000
}
```

Отправьте `url` клиенту нодой Telegram, Email или SMS.

## Совместимость

Разработана и запущена на n8n 2.25.7. Нужна версия Node.js, которую поддерживает ваш n8n.

## Планы

- Чеки через Subscribe API (создать, оплатить, проверить, отменить)
- Готовые примеры workflow (полный биллинг Merchant API с базой данных)
- Проверка Trigger-ноды в песочнице Payme (`test.paycom.uz`)
- Публикация в npm

## Ссылки

- [Документация Payme Business для разработчиков](https://developer.help.paycom.uz/)
- [Документация n8n по community-нодам](https://docs.n8n.io/integrations/#community-nodes)

## Контакты

Автор: [Navruzbek05](https://github.com/Navruzbek05) · kemalkonroy@gmail.com

Делаю автоматизацию на n8n под заказ для бизнеса в Узбекистане.

## Лицензия

[MIT](LICENSE.md)
