import { environment } from './environment';
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

export const sendMail = (dest, sbj, txt, tag) => {

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(environment.security.apiSendGridSecret);

    const msg = {
        to: dest,
        from: 'ronaldotonioli@gmail.com',
        subject:  sbj,
        text: txt,
        html: tag
      };      
      
      sgMail.send(msg);
      
}



