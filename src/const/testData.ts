import { User } from "@prisma/client";

export const user: User = {
    id: "casdkj8798hs",
    email: "test@example.com",
    password: "TestPassword@123",
    failedLoginAttempts: 0,
    status: "ENABLED",
    passwordResetToken: "alskjdlkasjdlsakjd",
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const deviceInfo = {
    name: "Test Phone",
    model: "Galaxy S10",
    platform: "Android",
    operatingSystem: "Android",
    osVersion: "17",
    manufacturer: "Samsung",
};
