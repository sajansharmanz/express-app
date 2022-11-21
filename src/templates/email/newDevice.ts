import { UserDevice } from "@prisma/client";

export const generateNewDeviceEmailTemplate = (deviceInfo: UserDevice) => `
    <h1>Hi!</h1>

    <p>
        We have detected a new login from a ${deviceInfo.manufacturer}
    </p>
`;
