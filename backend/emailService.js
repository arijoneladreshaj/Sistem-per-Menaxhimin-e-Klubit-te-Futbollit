const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function storeEmailTemplate(order) {
  const itemsRows = order.items.map(item => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;color:#e0e0e0;font-size:14px;">
        ${item.emri || item.name}
        <span style="color:#888;font-size:12px;margin-left:8px;">· ${item.madhesia || item.selectedSize} × ${item.sasia || item.qty}</span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;color:#fff;font-size:14px;font-weight:700;text-align:right;">
        €${((item.cmimi || item.price) * (item.sasia || item.qty)).toFixed(2)}
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="sq">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#cc0000 0%,#8b0000 50%,#1a0000 100%);padding:40px 40px 32px;text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
              alt="Manchester United" width="64" style="margin-bottom:16px;" />
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">
              Manchester United
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:4px;text-transform:uppercase;">
              Official Store
            </p>
          </td>
        </tr>

        <!-- SUCCESS BANNER -->
        <tr>
          <td style="background:#cc0000;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:18px;font-weight:700;letter-spacing:1px;">
              ✓ &nbsp;Porosia u Konfirmua!
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#111;padding:32px 40px;">
            <p style="color:#aaa;font-size:14px;margin:0 0 8px;">Pershendetje, <strong style="color:#fff;">${order.emri} ${order.mbiemri}</strong></p>
            <p style="color:#666;font-size:13px;margin:0 0 28px;line-height:1.6;">
              Porosia juaj <strong style="color:#cc0000;">#${order.id}</strong> u pranua me sukses.
              Do t'ju kontaktojmë kur porosia të jetë gati për dërgim.
            </p>

            <!-- ORDER DETAILS -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #222;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <tr>
                <td colspan="2" style="background:#1a1a1a;padding:12px 16px;color:#cc0000;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  Detajet e Porosisë
                </td>
              </tr>
              ${itemsRows}
              <tr>
                <td style="padding:10px 16px;color:#888;font-size:13px;border-top:1px solid #222;">Nëntotali</td>
                <td style="padding:10px 16px;color:#fff;font-size:13px;text-align:right;border-top:1px solid #222;">€${Number(order.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#888;font-size:13px;">Dërgesa</td>
                <td style="padding:10px 16px;font-size:13px;text-align:right;color:${order.shipping == 0 ? '#4ade80' : '#fff'};">
                  ${order.shipping == 0 ? "FALAS" : `€${Number(order.shipping).toFixed(2)}`}
                </td>
              </tr>
              <tr style="background:#1a1a1a;">
                <td style="padding:14px 16px;color:#fff;font-size:15px;font-weight:700;">Total</td>
                <td style="padding:14px 16px;color:#cc0000;font-size:15px;font-weight:700;text-align:right;">€${Number(order.total).toFixed(2)}</td>
              </tr>
            </table>

            <!-- SHIPPING INFO -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #222;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 4px;color:#cc0000;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">📦 Adresa e Dërgimit</p>
                  <p style="margin:0;color:#ccc;font-size:13px;line-height:1.7;">
                    ${order.adresa}, ${order.qyteti}, ${order.shteti}
                  </p>
                </td>
              </tr>
            </table>

            <!-- PAYMENT METHOD -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #222;border-radius:8px;margin-bottom:32px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 4px;color:#cc0000;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                    ${order.stripe_payment_id ? "💳 Pagesa Online (Stripe)" : "💵 Cash on Delivery"}
                  </p>
                  <p style="margin:0;color:#ccc;font-size:13px;">
                    ${order.stripe_payment_id
                      ? `Pagesa u krye me sukses. ID: <strong>${order.stripe_payment_id}</strong>`
                      : `Paguani €${Number(order.total).toFixed(2)} kur të merrni porosinë.`
                    }
                  </p>
                </td>
              </tr>
            </table>

            <p style="color:#555;font-size:12px;text-align:center;margin:0;">
              Brenda 3-5 ditëve pune do të merrni konfirmimin e dërgimit.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0a0a0a;padding:24px 40px;text-align:center;border-top:1px solid #1a1a1a;">
            <p style="margin:0 0 8px;color:#333;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Manchester United FC</p>
            <p style="margin:0;color:#222;font-size:11px;">Sir Matt Busby Way, Manchester M16 0RA</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ticketEmailTemplate(data) {
  const seatsRows = data.seats.map(seat => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;color:#e0e0e0;font-size:14px;">
        Ulëse ${seat.numri_uleses || seat.seatNumber}
        ${seat.is_vip || seat.isVip ? '<span style="background:#6A1B9A;color:#fff;font-size:10px;padding:2px 7px;border-radius:3px;margin-left:6px;font-weight:700;">VIP</span>' : ""}
        <br><span style="color:#888;font-size:12px;">Sektori ${seat.sektori || seat.sectorName} · ${seat.emri_bleresit || seat.firstName} ${seat.mbiemri_bleresit || seat.lastName}</span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;color:#fff;font-size:14px;font-weight:700;text-align:right;">
        €${Number(seat.cmimi || seat.price).toFixed(2)}
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="sq">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#cc0000 0%,#8b0000 50%,#1a0000 100%);padding:40px 40px 32px;text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
              alt="Manchester United" width="64" style="margin-bottom:16px;" />
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">
              Manchester United
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:4px;text-transform:uppercase;">
              Bileta Zyrtare
            </p>
          </td>
        </tr>

        <!-- SUCCESS BANNER -->
        <tr>
          <td style="background:#cc0000;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:18px;font-weight:700;letter-spacing:1px;">
              ✓ &nbsp;Biletat u Konfirmuan!
            </p>
          </td>
        </tr>

        <!-- MATCH INFO -->
        <tr>
          <td style="background:#1a0000;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:3px;text-transform:uppercase;">Ndeshja</p>
            <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">
              Manchester United <span style="color:#cc0000;">vs</span> ${data.kundershtari}
            </p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">
              📅 ${new Date(data.data_ndeshjes).toLocaleDateString("sq-AL", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
              &nbsp;·&nbsp; 🏟️ Old Trafford
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#111;padding:32px 40px;">
            <p style="color:#666;font-size:13px;margin:0 0 24px;line-height:1.6;">
              Biletat tuaja janë konfirmuar dhe pagesa u krye me sukses.
              Sillni këtë email ose ID-në e porosisë në hyrje të stadiumit.
            </p>

            <!-- SEATS TABLE -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #222;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <tr>
                <td colspan="2" style="background:#1a1a1a;padding:12px 16px;color:#cc0000;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  Ulëset e Rezervuara
                </td>
              </tr>
              ${seatsRows}
              <tr style="background:#1a1a1a;">
                <td style="padding:14px 16px;color:#fff;font-size:15px;font-weight:700;">Total</td>
                <td style="padding:14px 16px;color:#cc0000;font-size:15px;font-weight:700;text-align:right;">€${Number(data.total).toFixed(2)}</td>
              </tr>
            </table>

            <!-- PAYMENT CONFIRMATION -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #1a4a1a;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 4px;color:#4ade80;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">✅ Pagesa u Krye</p>
                  <p style="margin:0;color:#ccc;font-size:13px;">ID e transaksionit: <strong style="color:#fff;">${data.paymentId}</strong></p>
                </td>
              </tr>
            </table>

            <p style="color:#555;font-size:12px;text-align:center;margin:0;">
              Sillni këtë email ose numrin e porosisë në hyrje të stadiumit. Faleminderit!
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0a0a0a;padding:24px 40px;text-align:center;border-top:1px solid #1a1a1a;">
            <p style="margin:0 0 8px;color:#333;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Manchester United FC</p>
            <p style="margin:0;color:#222;font-size:11px;">Sir Matt Busby Way, Manchester M16 0RA</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendStoreConfirmation(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  await transporter.sendMail({
    from:    `"Manchester United Store" <${process.env.EMAIL_USER}>`,
    to:      order.email,
    subject: `✓ Porosia #${order.id} u Konfirmua — Manchester United Store`,
    html:    storeEmailTemplate(order),
  });
}

async function sendTicketConfirmation(email, data) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  await transporter.sendMail({
    from:    `"Manchester United FC" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `✓ Biletat për Man United vs ${data.kundershtari} — Konfirmim`,
    html:    ticketEmailTemplate(data),
  });
}

module.exports = { sendStoreConfirmation, sendTicketConfirmation };
