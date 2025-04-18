import cron from 'node-cron';
import { Borrow } from '../models/borrowModel.js';
import { User } from '../models/userModel.js';
import { sendEmail } from '../utils/sendEmail.js';

export const notifyUsers = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const onedayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const borrowers = await Borrow.find({
        dueDate: {
          $lt: onedayAgo,
        },
        returnDate: null,
        notified: false,
      });

      for (const element of borrowers) {
        if (element.user && element.user.email) {
          const user = await User.findById(element.user.id);
          sendEmail({
            email: user.email,
            subject: 'Book Return Reminder',
            message: `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                        .header { background-color: #f8f9fa; padding: 10px; text-align: center; border-bottom: 1px solid #ddd; }
                        .content { padding: 20px; }
                        .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #777; }
                        .warning { color: #dc3545; font-weight: bold; }
                        .btn { display: inline-block; background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Library Book Return Reminder</h2>
                        </div>
                        <div class="content">
                            <p>Hello ${element.user.name},</p>
                            <p>This is a friendly reminder that you have a book that is <span class="warning">overdue</span> for return.</p>
                            <p>Please return the book as soon as possible to avoid additional fines.</p>
                            <p class="warning">Note: Failure to return the book promptly will result in late fees according to our library policy.</p>
                            <p>If you have any questions or need an extension, please contact our library staff.</p>
                            <p>Thank you for your cooperation.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                `,
          });
          console.log('Email sent successfully');
          element.notified = true;
          await element.save();
        }
      }
    } catch (error) {
      console.error('Error in notifyUsers:', error);
    }
  });
};
