// import formData from 'form-data';
import { NodeMailgun } from 'ts-mailgun';
// import MailGun from 'mailgun.js';
const mailer = new NodeMailgun();
// const mailgun = new MailGun(formData);
mailer.apiKey = `${process.env.MAILGUN_API_KEY}`;
mailer.domain = `${process.env.MAILGUN_DOMAIN}`;

// const mg = mailgun.client({ username: 'api', key: `${process.env.MAILGUN_API_KEY}` });

export const sendEmail = async (to: string, subject: string,  message: string) => {
    mailer.fromTitle = 'Test title';
    mailer.fromEmail = 'nomsouzoanya@yahoo.co.uk';
    mailer.init();
    mailer
	.send(to, subject, message)
	.then((result) => console.log('Done', result))
	.catch((error) => console.error('Error: ', error));
};
// export const sendEmail = async (to: string, subject: string,  message: string) => {
//     await mg.messages.create(`${process.env.MAILGUN_DOMAIN}`, {
//         from: `nomsouzoanya@yahoo.co.uk`,
//         to: 'septemstacks@gmail.com',
//         subject,
//         // text,
//         html: message
//     });
//     console.log(`Email sent to ${to}`);
// };