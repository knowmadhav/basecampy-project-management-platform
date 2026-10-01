import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagerlink.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailGenContent);
  const emailHTML = mailGenerator.generate(options.mailGenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_POST,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mail)
  } catch (error) {
    console.error("Email service failed silently . this might have happened because of credentials ")
  }
};

const emailVerificationMailGenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We are excited to have you onboard",
      actions: {
        instructions:
          "To verify your email , please click on the following button",
        button: {
          color: "#102c4b",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need Help ? Have Question ? Reply to this email , we would love to help",
    },
  };
};

const forgotPasswordMailGenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of your account",
      actions: {
        instructions:
          "To reset your password , please click on the following button",
        button: {
          color: "#021020",
          text: "Reset your password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need Help ? Have Question ? Reply to this email , we would love to help",
    },
  };
};
export { emailVerificationMailGenContent, forgotPasswordMailGenContent , sendEmail };
