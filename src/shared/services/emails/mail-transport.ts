import Logger from 'bunyan';
import { config } from '@root/config';
import sendGridMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { BadRequestError } from '@global/helpers/error-handler';

const logger: Logger = config.createLogger('mail-transport');
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV !== 'production') {
      await this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      await this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!
      }
    });

    const mailOptions: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info('Development email sent successfully.');
    } catch (error) {
      logger.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOptions);
      logger.info('Production email sent successfully.');
    } catch (error) {
      logger.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
