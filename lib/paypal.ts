// Enlace clásico de PayPal (Website Payments Standard): no requiere API keys
// ni que el negocio sea partner de PayPal, solo su email. El dinero va
// directo a la cuenta de PayPal de quien la configuró, no a la de
// ClientFlow — a diferencia de Stripe Checkout, que hoy cobra a la cuenta
// de la plataforma. Se usa tanto en la página pública de pago como en el
// PDF de la factura.
export function buildPaypalPaymentUrl(
  email: string,
  amount: number,
  currency: string,
  description: string
): string {
  const params = new URLSearchParams({
    cmd: '_xclick',
    business: email,
    item_name: description,
    amount: amount.toFixed(2),
    currency_code: currency,
    no_shipping: '1',
    charset: 'UTF-8',
  })
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`
}
