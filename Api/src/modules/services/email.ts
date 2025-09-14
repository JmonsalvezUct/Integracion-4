import * as brevo from "@getbrevo/brevo";

const client = new brevo.TransactionalEmailsApi();
client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

export async function sendRecoveryEmail(to: string, link: string) {
  await client.sendTransacEmail({
    sender: { email: process.env.BREVO_SENDER, name: "FastPlanner" },
    to: [{ email: to }],
    subject: "Recuperación de contraseña",
    htmlContent: `
      <h1>Recupera tu contraseña</h1>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${link}">${link}</a>
      <p>Este enlace expira en 30 minutos.</p>
    `,
  });
}
