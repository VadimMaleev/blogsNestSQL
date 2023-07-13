import 'reflect-metadata';
import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapter {
  async sendEmailConfirmationCode(code: string, email: string) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bloggersauthmail@gmail.com', // generated ethereal user
        pass: 'qpjjtxsurfvalhhh', // generated ethereal password
      },
    });

    await transport.sendMail({
      from: '"Bloggers Api Registration endpoint" <bloggersauthmail@gmail.com>',
      to: email,
      subject: 'Confirm Account',
      html: `<a href='https://somesite.com/confirm-email?code=${code}'>Registration</a>`,
    });
  }

  async passwordRecovery(code: string, email: string) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bloggersauthmail@gmail.com', // generated ethereal user
        pass: 'qpjjtxsurfvalhhh', // generated ethereal password
      },
    });

    await transport.sendMail({
      from: '"Bloggers Api Password Recovery endpoint" <bloggersauthmail@gmail.com>',
      to: email,
      subject: 'Password Recovery',
      html: `<a href='https://somesite.com/password-recovery?recoveryCode=${code}'>PasswordRecovery</a>`,
    });
  }
}
