import request = require("supertest");
import * as jsonwebtoken from "jsonwebtoken";
import { subMinutes } from "date-fns";

import { app } from "../../app";

import prisma from "../../configs/prisma";
import { TSignInUserResponse } from "../../types/user";
import { JWT_SECRET } from "../../configs/environment";
import { deviceInfo, user } from "../../const/testData";

describe("POST /user/signup", () => {
    beforeEach(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    it("should return an error when email is not provided", async () => {
        const result = await request(app).post("/user/signup").send({
            password: user.password,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].message).toEqual("Email must be provided");
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("email");
        expect(result.body.errors[1].message).toEqual(
            "Email address must be a string"
        );
        expect(result.body.errors[1]).toHaveProperty("field");
        expect(result.body.errors[1].field).toEqual("email");
    });

    it("should return an error when email is not of type string", async () => {
        const result = await request(app).post("/user/signup").send({
            email: true,
            password: user.password,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual(
            "Email address must be a string"
        );
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("email");
    });

    it("should return an error when not a valid email", async () => {
        const result = await request(app).post("/user/signup").send({
            email: "myincorrectemailaddress",
            password: user.password,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual("Invalid email address");
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("email");
    });

    it("should return an error when password is not provided", async () => {
        const result = await request(app).post("/user/signup").send({
            email: user.email,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].message).toEqual(
            "Password must be provided"
        );
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("password");
        expect(result.body.errors[1].message).toEqual(
            "Password must be a string"
        );
        expect(result.body.errors[1]).toHaveProperty("field");
        expect(result.body.errors[1].field).toEqual("password");
    });

    it("should return an error when password is not of type string", async () => {
        const result = await request(app).post("/user/signup").send({
            email: user.email,
            password: true,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual(
            "Password must be a string"
        );
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("password");
    });

    it("should return an error when not a valid password", async () => {
        const result = await request(app).post("/user/signup").send({
            email: user.email,
            password: "123456",
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual("Invalid password");
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("password");
    });

    it("should return an error when device info is not provided", async () => {
        const result = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Device info must be provided"
        );
    });

    it("should return an error when device info proprty is missing", async () => {
        const result = await request(app)
            .post("/user/signup")
            .send({
                email: user.email,
                password: user.password,
                deviceInfo: {
                    ...deviceInfo,
                    platform: undefined,
                },
            });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Device info platform must be provided"
        );
    });

    it("should return an error when device info proprty is not a string", async () => {
        const result = await request(app)
            .post("/user/signup")
            .send({
                email: user.email,
                password: user.password,
                deviceInfo: {
                    ...deviceInfo,
                    name: 123,
                },
            });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Device info name must be a string"
        );
    });

    it("should return an error when the email address has already been used", async () => {
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const result2 = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        expect(result2.statusCode).toEqual(400);
        expect(result2.body).toHaveProperty("errors");
        expect(result2.body.errors).toHaveLength(1);
        expect(result2.body.errors[0].message).toEqual(
            "Email address already exists"
        );
        expect(result2.body.errors[0]).toHaveProperty("field");
        expect(result2.body.errors[0].field).toEqual("email");
    });

    it("should return a successful response containing user and token if no issues", async () => {
        const result = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(201);
        expect(result.body).toHaveProperty("user");
        expect(Object.values(result.body.user)).toHaveLength(6);
        expect(result.body.user).toHaveProperty("id");
        expect(result.body.user.id).toBeDefined();
        expect(result.body.user).toHaveProperty("email");
        expect(result.body.user.email).toBeDefined();
        expect(result.body.user).toHaveProperty("failedLoginAttempts");
        expect(result.body.user.failedLoginAttempts).toEqual(0);
        expect(result.body.user).toHaveProperty("status");
        expect(result.body.user.status).toBeDefined();
        expect(result.body.user).toHaveProperty("createdAt");
        expect(result.body.user.createdAt).toBeDefined();
        expect(result.body.user).toHaveProperty("updatedAt");
        expect(result.body.user.updatedAt).toBeDefined();
        expect(result.body).toHaveProperty("token");
        expect(result.body.token).toBeDefined();
    });
});

describe("POST /user/login", () => {
    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        // Sign up a default user
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        jest.resetAllMocks();
    });

    it("should return an error when email is not provided", async () => {
        const result = await request(app).post("/user/login").send({
            password: user.password,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].message).toEqual("Email must be provided");
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("email");
        expect(result.body.errors[1].message).toEqual(
            "Email address must be a string"
        );
        expect(result.body.errors[1]).toHaveProperty("field");
        expect(result.body.errors[1].field).toEqual("email");
    });

    it("should return an error when email is not of type string", async () => {
        const result = await request(app).post("/user/login").send({
            email: true,
            password: user.password,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual(
            "Email address must be a string"
        );
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("email");
    });

    it("should return an error when not a valid email", async () => {
        const result = await request(app).post("/user/login").send({
            email: "myincorrectemailaddress",
            password: user.password,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual("Invalid email address");
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("email");
    });

    it("should return an error when password is not provided", async () => {
        const result = await request(app).post("/user/login").send({
            email: user.email,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].message).toEqual(
            "Password must be provided"
        );
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("password");
        expect(result.body.errors[1].message).toEqual(
            "Password must be a string"
        );
        expect(result.body.errors[1]).toHaveProperty("field");
        expect(result.body.errors[1].field).toEqual("password");
    });

    it("should return an error when password is not of type string", async () => {
        const result = await request(app).post("/user/login").send({
            email: user.email,
            password: true,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual(
            "Password must be a string"
        );
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("password");
    });

    it("should return an error when not a valid password", async () => {
        const result = await request(app).post("/user/login").send({
            email: user.email,
            password: "123456",
            deviceInfo,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual("Invalid password");
        expect(result.body.errors[0]).toHaveProperty("field");
        expect(result.body.errors[0].field).toEqual("password");
    });

    it("should return an error when device info is not provided", async () => {
        const result = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Device info must be provided"
        );
    });

    it("should return an error when device info proprty is missing", async () => {
        const result = await request(app)
            .post("/user/login")
            .send({
                email: user.email,
                password: user.password,
                deviceInfo: {
                    ...deviceInfo,
                    platform: undefined,
                },
            });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Device info platform must be provided"
        );
    });

    it("should return an error when device info proprty is not a string", async () => {
        const result = await request(app)
            .post("/user/login")
            .send({
                email: user.email,
                password: user.password,
                deviceInfo: {
                    ...deviceInfo,
                    name: 123,
                },
            });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Device info name must be a string"
        );
    });

    it("should return a successful response containing user and token if no issues", async () => {
        const result = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("user");
        expect(Object.values(result.body.user)).toHaveLength(6);
        expect(result.body.user).toHaveProperty("id");
        expect(result.body.user.id).toBeDefined();
        expect(result.body.user).toHaveProperty("email");
        expect(result.body.user.email).toBeDefined();
        expect(result.body.user).toHaveProperty("failedLoginAttempts");
        expect(result.body.user.failedLoginAttempts).toEqual(0);
        expect(result.body.user).toHaveProperty("status");
        expect(result.body.user.status).toBeDefined();
        expect(result.body.user).toHaveProperty("createdAt");
        expect(result.body.user.createdAt).toBeDefined();
        expect(result.body.user).toHaveProperty("updatedAt");
        expect(result.body.user.updatedAt).toBeDefined();
        expect(result.body).toHaveProperty("token");
        expect(result.body.token).toBeDefined();
    });

    it("should return an error when the incorrect password is used", async () => {
        const result = await request(app).post("/user/login").send({
            email: user.email,
            password: "Test@Password15645",
            deviceInfo,
        });

        expect(result.statusCode).toEqual(401);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Authentication error"
        );
    });

    it("should return an error when the account is locked", async () => {
        await request(app).post("/user/login").send({
            email: user.email,
            password: "Test@Password15645",
            deviceInfo,
        });

        await request(app).post("/user/login").send({
            email: user.email,
            password: "Test@Password15645",
            deviceInfo,
        });

        await request(app).post("/user/login").send({
            email: user.email,
            password: "Test@Password15645",
            deviceInfo,
        });

        await request(app).post("/user/login").send({
            email: user.email,
            password: "Test@Password15645",
            deviceInfo,
        });

        const result = await request(app).post("/user/login").send({
            email: user.email,
            password: "Test@Password15645",
            deviceInfo,
        });

        expect(result.statusCode).toEqual(401);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain("Account locked");
    });
});

describe("POST /user/logout", () => {
    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        // Sign up a default user
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        jest.resetAllMocks();
    });

    it("should return a successful response", async () => {
        // Sign in with default user
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .post("/user/logout")
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(204);
    });
});

describe("POST /user/logoutAll", () => {
    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        // Sign up a default user
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        jest.resetAllMocks();
    });

    it("should return a successful response", async () => {
        // Sign in with default user
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .post("/user/logoutAll")
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(204);
    });
});

describe("GET /user/me", () => {
    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        // Sign up a default user
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        jest.resetAllMocks();
    });

    it("should return a successful response containing user and token when requesting me", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .get("/user/me")
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("user");
        expect(Object.values(result.body.user)).toHaveLength(6);
        expect(result.body.user).toHaveProperty("id");
        expect(result.body.user.id).toBeDefined();
        expect(result.body.user).toHaveProperty("email");
        expect(result.body.user.email).toBeDefined();
        expect(result.body.user).toHaveProperty("failedLoginAttempts");
        expect(result.body.user.failedLoginAttempts).toEqual(0);
        expect(result.body.user).toHaveProperty("status");
        expect(result.body.user.status).toBeDefined();
        expect(result.body.user).toHaveProperty("createdAt");
        expect(result.body.user.createdAt).toBeDefined();
        expect(result.body.user).toHaveProperty("updatedAt");
        expect(result.body.user.updatedAt).toBeDefined();
        expect(result.body).toHaveProperty("token");
        expect(result.body.token).toBeDefined();
    });
});

describe("DELETE /user/me", () => {
    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        // Sign up a default user
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        jest.resetAllMocks();
    });

    it("should return a successful response when deleting me", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .delete("/user/me")
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(204);
    });
});

describe("PATCH /user/me", () => {
    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        // Sign up a default user
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        jest.resetAllMocks();
    });

    it("should return an error response when updating me with email that is not a string", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                email: false,
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Email address must be a string"
        );
    });

    it("should return an error response when updating me with email that is not a string", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                email: false,
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Email address must be a string"
        );
    });

    it("should return an error response when updating me with invalid email", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                email: "not an email",
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Invalid email address"
        );
    });

    it("should return an error response when updating me with password that is not a string", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                password: false,
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Password must be a string"
        );
    });

    it("should return an error response when updating me with invalid password", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                password: "invalidpassword",
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Invalid password"
        );
    });

    it("should return an error response when updating me with status that is not a string", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                status: false,
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Status must be a string"
        );
    });

    it("should return an error response when updating me with invalid status", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                status: "INVALID",
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain("Invalid status");
    });

    it("should return an error response when updating me with an email already in use", async () => {
        const inUseEmail = "test2@example.com";

        await request(app).post("/user/signup").send({
            email: inUseEmail,
            password: user.password,
            deviceInfo,
        });

        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                email: inUseEmail,
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Email address already in use"
        );
    });

    it("should return a successful response containing user and token when updating me", async () => {
        const response = await request(app).post("/user/login").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignInUserResponse;

        const result = await request(app)
            .patch("/user/me")
            .send({
                email: "test3@example.com",
                status: "LOCKED",
            })
            .set({ Authorization: `Bearer ${res.token}` });

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("user");
        expect(Object.values(result.body.user)).toHaveLength(6);
        expect(result.body.user).toHaveProperty("id");
        expect(result.body.user.id).toBeDefined();
        expect(result.body.user).toHaveProperty("email");
        expect(result.body.user.email).toEqual("test3@example.com");
        expect(result.body.user).toHaveProperty("failedLoginAttempts");
        expect(result.body.user.failedLoginAttempts).toEqual(0);
        expect(result.body.user).toHaveProperty("status");
        expect(result.body.user.status).toEqual("LOCKED");
        expect(result.body.user).toHaveProperty("createdAt");
        expect(result.body.user.createdAt).toBeDefined();
        expect(result.body.user).toHaveProperty("updatedAt");
        expect(result.body.user.updatedAt).toBeDefined();
        expect(result.body).toHaveProperty("token");
        expect(result.body.token).toBeDefined();
    });
});

describe("POST /user/forgotpassword", () => {
    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        // Sign up a default user
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        jest.resetAllMocks();
    });

    it("should return an error response when forgot password without an email address", async () => {
        const result = await request(app).post("/user/forgotpassword").send({
            email: undefined,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual("Email must be provided");
        expect(result.body.errors[1].message).toEqual(
            "Email address must be a string"
        );
    });

    it("should return an error response when forgot password with email address that is not a string", async () => {
        const result = await request(app).post("/user/forgotpassword").send({
            email: false,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Email address must be a string"
        );
    });

    it("should return an error response when forgot password with invalid email", async () => {
        const result = await request(app).post("/user/forgotpassword").send({
            email: "not an email",
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain(
            "Invalid email address"
        );
    });

    it("should return an error response when forgot password with email address that does not exist", async () => {
        const result = await request(app).post("/user/forgotpassword").send({
            email: "idontexist@example.com",
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors)).toContain("No user found");
    });

    it("should return a successful response when sending a valid forgot password request", async () => {
        const result = await request(app).post("/user/forgotpassword").send({
            email: user.email,
        });

        expect(result.statusCode).toEqual(200);
    });
});

describe("POST /user/resetpassword", () => {
    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        // Sign up a default user
        await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        jest.resetAllMocks();
    });

    it("should return an error response when password is not provided", async () => {
        const result = await request(app).post("/user/resetpassword").send({
            token: "jsdkfjsdoifus09dfujksdfjs0dfu2it4jlkfdngfdg",
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].message).toEqual(
            "Password must be provided"
        );
        expect(result.body.errors[1].message).toEqual(
            "Password must be a string"
        );
    });

    it("should return an error response when password is not of type string", async () => {
        const result = await request(app).post("/user/resetpassword").send({
            token: "jsdkfjsdoifus09dfujksdfjs0dfu2it4jlkfdngfdg",
            password: true,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual(
            "Password must be a string"
        );
    });

    it("should return an error response when not a valid password", async () => {
        const result = await request(app).post("/user/resetpassword").send({
            token: "jsdkfjsdoifus09dfujksdfjs0dfu2it4jlkfdngfdg",
            password: "notvalidpassword",
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual("Invalid password");
    });

    it("should return an error response when token is not provided", async () => {
        const result = await request(app).post("/user/resetpassword").send({
            password: user.password,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].message).toEqual("Token must be provided");
        expect(result.body.errors[1].message).toEqual("Token must be a string");
    });

    it("should return an error response when token is not of type string", async () => {
        const result = await request(app).post("/user/resetpassword").send({
            password: user.password,
            token: true,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual("Token must be a string");
    });

    it.skip("should return a error response when token more than 30mins old", async () => {
        //TODO: Figure out how we should perform this test

        const sixtyMinsAgo = subMinutes(new Date(), 60);

        const token = jsonwebtoken.sign(
            {
                email: user.email,
                iat: sixtyMinsAgo.getTime() / 1000,
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            JWT_SECRET!
        );

        const result = await request(app).post("/user/resetpassword").send({
            password: user.password,
            token: token,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual("Token expired");
    });

    it("should return an error response when token not matching of user", async () => {
        const token = jsonwebtoken.sign(
            {
                email: user.email,
                iat: Date.now() / 1000,
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            JWT_SECRET!
        );

        const result = await request(app).post("/user/resetpassword").send({
            password: user.password,
            token,
        });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].message).toEqual("Invalid token");
    });

    it("should return a successful response when valid reset password request", async () => {
        const response = await request(app).post("/user/forgotpassword").send({
            email: user.email,
        });

        const result = await request(app).post("/user/resetpassword").send({
            password: user.password,
            token: response.body.token,
        });

        expect(result.statusCode).toEqual(204);
    });
});
