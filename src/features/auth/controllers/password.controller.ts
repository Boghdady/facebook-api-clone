import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import publicIp from 'ip';
import moment from 'moment';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email-queue';
import HTTP_STATUS from 'http-status-codes';

import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';

export class PasswordController {
  // Send a resetLink to email
  @joiValidation(emailSchema)
  public async forgotPassword(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { email } = req.body;
    const existingAuthUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingAuthUser) {
      throw new BadRequestError(`No Account for this ${email}`);
    }

    //  generate reset token
    const randomBytes: Buffer = await crypto.randomBytes(20);
    const resetToken: string = randomBytes.toString('hex');

    //  update auth user with resetToken and token expiration times
    await authService.updatePasswordTokenAndExpires(`${existingAuthUser._id}`, resetToken, Date.now() * 60 * 60 * 1000);

    // prepare email template
    const resetLink: string = `${config.CLIENT_URL}/reset-password/?token=${resetToken}`;
    const emailTemplate: string = forgotPasswordTemplate.passwordResetTemplate(existingAuthUser.username, resetLink);

    // add email job
    await emailQueue.addEmailJob('forgotPasswordEmail', {
      receiverEmail: email,
      template: emailTemplate,
      subject: 'Reset Your Password'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
  }

  @joiValidation(passwordSchema)
  public async resetPassword(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    //  check if reset token exist and not expires
    const existingAuthUser: IAuthDocument = await authService.getAuthUserByPasswordResetToken(token);
    if (!existingAuthUser) {
      throw new BadRequestError('Password reset token has expired');
    }

    //  update password
    existingAuthUser.password = password;
    existingAuthUser.passwordResetExpires = undefined;
    existingAuthUser.passwordResetToken = undefined;
    await existingAuthUser.save();

    //  prepare email template
    const emailTemplateParams: IResetPasswordParams = {
      username: existingAuthUser.username,
      email: existingAuthUser.email,
      ipaddress: publicIp.address(),
      date: moment().format('DD//MM//YYYY HH:mm:ss')
    };
    const emailTemplate: string = resetPasswordTemplate.passwordResetConfirmationTemplate(emailTemplateParams);

    //  add email job
    await emailQueue.addEmailJob('forgotPasswordEmail', {
      receiverEmail: existingAuthUser.email,
      template: emailTemplate,
      subject: 'Password Reset Confirmation'
    });

    //  send response
    res.status(HTTP_STATUS.OK).json({ message: 'Password Successfully Updated' });
  }
}
