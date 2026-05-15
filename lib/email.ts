import 'server-only'
import nodemailer from 'nodemailer'

let _transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (_transporter) return _transporter

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    throw new Error('Faltan variables de entorno GMAIL_USER o GMAIL_APP_PASSWORD')
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  return _transporter
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// ── Enviar email ──────────────────────────────────────────────────────────────

export async function sendEmail(opts: EmailOptions): Promise<void> {
  const transporter = getTransporter()
  const from = `CIDCA <${process.env.GMAIL_USER}>`

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  })
}

// ── Templates ─────────────────────────────────────────────────────────────────

/**
 * Escapa caracteres HTML peligrosos para prevenir XSS en templates de email.
 * Los clientes de correo con soporte HTML pueden ejecutar scripts si no se sanitiza.
 */
function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function buildRecuperacionEmail(nombre: string, resetUrl: string): {
  subject: string
  html: string
  text: string
} {
  const subject = 'Recupera tu contraseña — CIDCA'
  const nombreSafe = escapeHtml(nombre)

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="background:linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.02) 100%); padding:1px; border-radius:12px;">
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:11px;overflow:hidden;">
                
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a5f,#0f2645);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">CIDCA</h1>
                    <p style="margin:6px 0 0;color:#ffffff;font-size:13px;">Sistema de Gestión de Aprendizaje</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 12px;color:#ffffff;font-size:20px;font-weight:700;">
                      Restablecer contraseña
                    </h2>
                    <p style="margin:0 0 8px;color:#ffffff;font-size:14px;line-height:1.6;">
                      Hola${nombreSafe ? ` <strong style="color:#ffffff;">${nombreSafe}</strong>` : ''},
                    </p>
                    <p style="margin:0 0 28px;color:#ffffff;font-size:14px;line-height:1.6;">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                      Haz clic en el botón para crear una nueva contraseña. Este enlace
                      <strong style="color:#ffffff;">expira en 1 hora</strong>.
                    </p>

                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                      <tr>
                        <td align="center" style="background:#f59e0b;border-radius:8px;">
                          <a href="${resetUrl}"
                             style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.2px;">
                            Restablecer contraseña
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;color:#ffffff;font-size:12px;line-height:1.6;">
                      Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta seguirá segura.
                    </p>
                    <p style="margin:0;color:#ffffff;font-size:12px;line-height:1.6;">
                      O copia y pega este enlace en tu navegador:<br/>
                      <a href="${resetUrl}" style="color:#f59e0b;word-break:break-all;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
                    <p style="margin:0;color:#ffffff;font-size:12px;">
                      © ${new Date().getFullYear()} CIDCA. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Restablecer contraseña — CIDCA

Hola${nombreSafe ? ` ${nombreSafe}` : ''},

Recibimos una solicitud para restablecer tu contraseña.
Usa el siguiente enlace (expira en 1 hora):

${resetUrl}

Si no realizaste esta solicitud, ignora este correo.

— Equipo CIDCA
  `.trim()

  return { subject, html, text }
}

export function buildBienvenidaEmail(nombre: string, email: string): {
  subject: string
  html: string
  text: string
} {
  const subject = '¡Bienvenido/a a CIDCA! 🎓'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const nombreSafe = escapeHtml(nombre)
  const emailSafe = escapeHtml(email)

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="background:linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.02) 100%); padding:1px; border-radius:12px;">
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:11px;overflow:hidden;">
                
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a5f,#0f2645);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">CIDCA</h1>
                    <p style="margin:6px 0 0;color:#ffffff;font-size:13px;">Sistema de Gestión de Aprendizaje</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 16px;color:#ffffff;font-size:20px;font-weight:700;">
                      ¡Bienvenido/a, ${nombreSafe}! 🎓
                    </h2>
                    <p style="margin:0 0 20px;color:#ffffff;font-size:14px;line-height:1.6;">
                      Tu cuenta ha sido creada exitosamente con el correo
                      <strong style="color:#ffffff;text-decoration:none;">${emailSafe}</strong>.
                      Ya puedes acceder al aula virtual y comenzar tu aprendizaje.
                    </p>

                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                      <tr>
                        <td align="center" style="background:#f59e0b;border-radius:8px;">
                          <a href="${appUrl}/aula/cursos"
                             style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">
                            Ir al Aula Virtual
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;color:#ffffff;font-size:12px;line-height:1.6;">
                      Si tienes algún problema, puedes contactarnos a través de la sección de Soporte en el aula.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
                    <p style="margin:0;color:#ffffff;font-size:12px;">
                      © ${new Date().getFullYear()} CIDCA. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `¡Bienvenido/a a CIDCA, ${nombre}!\n\nTu cuenta fue creada con el correo ${email}.\nAccede al aula: ${appUrl}/aula/cursos\n\n— Equipo CIDCA`

  return { subject, html, text }
}
