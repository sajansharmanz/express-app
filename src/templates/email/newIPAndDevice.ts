import { UserDevice, UserIPTracking } from "@prisma/client";

export const generateNewIPAndDeviceEmailTemplate = (
    deviceInfo: UserDevice,
    ipInfo: UserIPTracking
) => `
    <h1>Hi!</h1>

    <p>
        We have detected a new login from a ${deviceInfo.manufacturer} ${ipInfo.city}
    </p>
`;
