import { UserIPTracking } from "@prisma/client";

export const generateNewIPEmailTemplate = (ipInfo: UserIPTracking) => `
    <h1>Hi!</h1>

    <p>
        We have detected a new login from a ${ipInfo.city}
    </p>
`;
