export const patientTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8" />
    <title>Welcome to MediCare</title>
    </head>
    <body style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2196F3;">Welcome to MediChain, {{name}}!</h2>

        <p>Dear {{name}},</p>

        <p>
        Your patient account has been successfully created on <strong>MediCare</strong>.
        You can now easily book consultations, manage appointments, and access your medical records securely.
        </p>

        <p>
        If you did not request this account, please contact our support team immediately.
        </p>

        <p>Best regards,<br /><strong>MediCare Team</strong></p>
    </div>
    </body>
    </html>

`;

export const doctorsTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8" />
    <title>Welcome to MediCare</title>
    </head>
    <body style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Welcome to MediCare, Dr. {{name}}!</h2>

        <p>Dear Dr. {{name}},</p>

        <p>
        Your doctor account has been successfully created on <strong>MediChain</strong>.
        You can now manage patient consultations, write diagnoses, and maintain medical records efficiently.
        </p>

        <p>
        If you did not request this registration, please reach out to our support team immediately.
        </p>

        <p>Regards,<br /><strong>MediCare Team</strong></p>
    </div>
    </body>
    </html>

`;
