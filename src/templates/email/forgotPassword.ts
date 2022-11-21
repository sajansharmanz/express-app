import { DOMAIN_NAME, PORT } from "../../configs/environment";

export const generateForgotPasswordTemplate = (token: string) =>
    `
    Forgot password token: ${token}
    <br />
    Reset URL http://${DOMAIN_NAME}:${PORT}/changepassword?token=${token}
    `;
