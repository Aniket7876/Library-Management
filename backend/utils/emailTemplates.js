export function generateVerificationOtpEmailTemplate(otpCode) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Dear User,</p>
        <p>Thank you for registering with our Library Management System. Please use the following verification code to verify your account:</p>
        <div style="text-align: center; padding: 20px;">
          <strong style="font-size: 24px; color: #007bff;">${otpCode}</strong>
        </div>
        <p>This verification code will expire in 5 minutes.</p>
        <p>If you did not request this verification, please ignore this email.</p>
        <p>Sincerely,<br>
        The Library Management System Team</p>
      </div>
    </body>
    </html>
  `;
}

export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Dear User,</p>
        <p>You recently requested to reset your password for your account. Please click the button below to reset it:</p>
        <div style="text-align: center; padding: 20px;">
          <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If the button above doesn't work, you can also copy and paste the following URL into your browser:</p>
        <p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <p>Sincerely,<br>
        The Library Management System Team</p>
      </div>
    </body>
    </html>
  `;
}
