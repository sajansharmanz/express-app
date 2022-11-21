import request = require("supertest");

import { app } from "../../app";

import prisma from "../../configs/prisma";
import { deviceInfo, user } from "../../const/testData";
import { TSignUpUserResponse } from "../../types/user";

describe("POST /profile/avatar", () => {
    let token: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;
    });

    beforeEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        await request(app)
            .post("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test",
                lastName: "test",
            });
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return an error when no content type", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "Internal server error"
        );
    });

    it("should return an error when wrong content type", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .set("Content-Type", "application/json");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "Request must be multipart/form-data"
        );
    });

    it("should return an error when file attached but field name not avatar", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("notAvatar", "src/tests/files/black-box.png");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "An upload field was found but didn't have the name avatar"
        );
    });

    it("should return an error when file attached is not valid format", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/random.js");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "File type must be .png, .jpg or.jpeg"
        );
    });

    it("should return a successful response when file attached and field name avatar", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/black-box.png");

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("avatar");
        expect(result.body.avatar).toContain("base64");
    });
});

describe("PATCH /profile", () => {
    let token: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;
    });

    beforeEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        await request(app)
            .post("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test",
                lastName: "test",
            });
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return an error when no first name, last name or skin tone", async () => {
        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "You must provide either a first name, last name or skin tone"
        );
    });

    it("should return an error when first name not string", async () => {
        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: true,
            });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "First name must be a string"
        );
    });

    it("should return an error when last name not string", async () => {
        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                lastName: true,
            });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "Last name must be a string"
        );
    });

    it("should return an error when skin tone not string", async () => {
        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                skinTone: true,
            });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "Skin tone must be a string"
        );
    });

    it("should return an error when no profile exists for user", async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test2",
                lastName: "test2",
            });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "No profile exists for user"
        );
    });

    it("should return a successful response when valid first name only", async () => {
        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test2",
            });

        expect(result.statusCode).toEqual(200);
        expect(result.body.firstName).toEqual("test2");
    });

    it("should return a successful response when valid last name only", async () => {
        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                lastName: "test2",
            });

        expect(result.statusCode).toEqual(200);
        expect(result.body.lastName).toEqual("test2");
    });

    it("should return a successful response when valid skin tone only", async () => {
        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                skinTone: "DARK",
            });

        expect(result.statusCode).toEqual(200);
        expect(result.body.skinTone).toEqual("DARK");
    });

    it("should return a successful response when valid first name, last name and skin tone", async () => {
        const result = await request(app)
            .patch("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test2",
                lastName: "test2",
                skinTone: "DARK",
            });

        expect(result.statusCode).toEqual(200);
        expect(result.body.firstName).toEqual("test2");
        expect(result.body.lastName).toEqual("test2");
        expect(result.body.skinTone).toEqual("DARK");
    });
});

describe("GET /profile", () => {
    let token: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;
    });

    beforeEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        await request(app)
            .post("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test",
                lastName: "test",
            });
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return a successful response with empty body when no profile exists", async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        const result = await request(app)
            .get("/profile")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(200);
        expect(result.body).not.toHaveProperty("firstName");
        expect(result.body).not.toHaveProperty("lastName");
    });

    it("should return a successful response with profile when one exists", async () => {
        const result = await request(app)
            .get("/profile")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(200);
        expect(result.body.firstName).toEqual("test");
        expect(result.body.lastName).toEqual("test");
    });
});

describe("DELETE /profile", () => {
    let token: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;
    });

    beforeEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        await request(app)
            .post("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test",
                lastName: "test",
            });
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return a successful response", async () => {
        const result = await request(app)
            .delete("/profile")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(204);
    });
});

describe("POST /profile/avatar", () => {
    let token: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;
    });

    beforeEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        await request(app)
            .post("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test",
                lastName: "test",
            });
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return an error when no content type", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "Internal server error"
        );
    });

    it("should return an error when wrong content type", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .set("Content-Type", "application/json");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "Request must be multipart/form-data"
        );
    });

    it("should return an error when file attached but field name not avatar", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("notAvatar", "src/tests/files/black-box.png");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "An upload field was found but didn't have the name avatar"
        );
    });

    it("should return an error when file attached is not valid format", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/random.js");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "File type must be .png, .jpg or.jpeg"
        );
    });

    it("should return a successful response when file attached and field name avatar", async () => {
        const result = await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/black-box.png");

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("avatar");
        expect(result.body.avatar).toContain("base64");
    });
});

describe("GET /profile/avatar", () => {
    let token: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;
    });

    beforeEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        await request(app)
            .post("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test",
                lastName: "test",
            });

        await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/black-box.png");
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return no profile and avatar when profile does not exist", async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        const result = await request(app)
            .get("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("avatar");
        expect(result.body.avatar).toEqual("");
    });

    it("should return just profile when profile exists but no avatar", async () => {
        await prisma.$queryRaw`TRUNCATE "File" CASCADE`;

        const result = await request(app)
            .get("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("avatar");
        expect(result.body.avatar).toEqual("");
    });

    it("should return profile and avatar when both exist", async () => {
        const result = await request(app)
            .get("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("avatar");
        expect(result.body.avatar).toContain("base64");
    });
});

describe("PATCH /profile/avatar", () => {
    let token: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;

        await request(app)
            .post("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test",
                lastName: "test",
            });

        await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/black-box.png");
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return an error when no content type", async () => {
        const result = await request(app)
            .patch("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(500);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "Internal server error"
        );
    });

    it("should return an error when wrong content type", async () => {
        const result = await request(app)
            .patch("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .set("Content-Type", "application/json");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "Request must be multipart/form-data"
        );
    });

    it("should return an error when file attached but field name not avatar", async () => {
        const result = await request(app)
            .patch("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("notAvatar", "src/tests/files/black-box.png");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "An upload field was found but didn't have the name avatar"
        );
    });

    it("should return an error when file attached is not valid format", async () => {
        const result = await request(app)
            .patch("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/random.js");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toContain(
            "File type must be .png, .jpg or.jpeg"
        );
    });

    it("should return a successful response when file attached and field name avatar", async () => {
        const result = await request(app)
            .patch("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/black-box.png");

        expect(result.statusCode).toEqual(200);
        expect(result.body).toHaveProperty("avatar");
        expect(result.body.avatar).toContain("base64");
    });
});

describe("DELETE /profile/avatar", () => {
    let token: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;
    });

    beforeEach(async () => {
        await request(app)
            .post("/profile")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                firstName: "test",
                lastName: "test",
            });

        await request(app)
            .post("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` })
            .attach("avatar", "src/tests/files/black-box.png");
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return a successful response when no profile and avatar exists", async () => {
        await prisma.$queryRaw`TRUNCATE "Profile" CASCADE`;

        const result = await request(app)
            .delete("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(204);
    });

    it("should return a successful response when profile exists but no avatar exists", async () => {
        await prisma.$queryRaw`TRUNCATE "File" CASCADE`;

        const result = await request(app)
            .delete("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(204);
    });

    it("should return a successful response when profile and avatar exist", async () => {
        const result = await request(app)
            .delete("/profile/avatar")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(204);
    });
});
