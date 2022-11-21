import { Post } from "@prisma/client";
import request = require("supertest");

import { app } from "../../app";

import prisma from "../../configs/prisma";
import { deviceInfo, user } from "../../const/testData";
import { TSignUpUserResponse } from "../../types/user";

describe("POST /posts", () => {
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

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return an error when content is not provided", async () => {
        const result = await request(app)
            .post("/posts")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "Content must be provided"
        );
    });

    it("should return an error when content is not string", async () => {
        const result = await request(app)
            .post("/posts")
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: true });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "Content must be a string"
        );
    });

    it("should return a successful response when valid request", async () => {
        const result = await request(app)
            .post("/posts")
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: "test content" });

        expect(result.statusCode).toEqual(201);
        expect(result.body.id).toBeDefined();
        expect(result.body.status).toBeDefined();
        expect(result.body.authorId).toBeDefined();
        expect(result.body.versions).toBeDefined();
    });
});

describe("GET /posts", () => {
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

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return a successful response when valid request", async () => {
        const result = await request(app)
            .get("/posts")
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(200);
    });
});

describe("GET /posts/:postId", () => {
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

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return a successful response when valid request", async () => {
        const post = await request(app)
            .post("/posts")
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: "test content" });

        const result = await request(app)
            .get(`/posts/${post.body.id}`)
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(200);
        expect(result.body.id).toBeDefined();
        expect(result.body.status).toBeDefined();
        expect(result.body.authorId).toBeDefined();
        expect(result.body.versions).toBeDefined();
    });
});

describe("PATCH /posts/:postId", () => {
    let token: string;
    let postId: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;

        const response2 = await request(app)
            .post("/posts")
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: "test content" });

        const res2 = response2.body as Post;
        postId = res2.id;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return an error when content is not provided", async () => {
        const result = await request(app)
            .patch(`/posts/${postId}`)
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "Content must be provided"
        );
    });

    it("should return an error when content is not string", async () => {
        const result = await request(app)
            .patch(`/posts/${postId}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: true });

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors[0].message).toEqual(
            "Content must be a string"
        );
    });

    it("should return an error when trying to update a post that doesn't exist", async () => {
        const result = await request(app)
            .patch(`/posts/kalsjdlkasjd`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: "new test content" });

        expect(result.statusCode).toEqual(404);
        expect(JSON.stringify(result.body.errors)).toContain(
            "Post does not exist"
        );
    });

    it("should return an error when trying to update someone elses post", async () => {
        const response = await request(app).post("/user/signup").send({
            email: "test2@example.com",
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        const token = res.token;

        const result = await request(app)
            .patch(`/posts/${postId}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: "new test content" });

        expect(result.statusCode).toEqual(401);
        expect(JSON.stringify(result.body.errors)).toContain(
            "No permission to make this request"
        );
    });

    it("should return a successful response when valid request", async () => {
        const result = await request(app)
            .patch(`/posts/${postId}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: "new test content" });

        expect(result.statusCode).toEqual(200);
        expect(result.body.id).toBeDefined();
        expect(result.body.status).toBeDefined();
        expect(result.body.authorId).toBeDefined();
        expect(result.body.versions).toBeDefined();
    });
});

describe("DELETE /posts/:postId", () => {
    let token: string;
    let postId: string;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;

        const response = await request(app).post("/user/signup").send({
            email: user.email,
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        token = res.token;

        const response2 = await request(app)
            .post("/posts")
            .set({ Authorization: `Bearer ${token}` })
            .send({ content: "test content" });

        const res2 = response2.body as Post;
        postId = res2.id;
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE "User" CASCADE`;
        jest.resetAllMocks();
    });

    it("should return an error when trying to delete a post that doesn't exist", async () => {
        const result = await request(app)
            .delete(`/posts/alksjdlkasjdlk`)
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(404);
        expect(JSON.stringify(result.body.errors)).toContain(
            "Post does not exist"
        );
    });

    it("should return an error when trying to delete someone elses post", async () => {
        const response = await request(app).post("/user/signup").send({
            email: "test2@example.com",
            password: user.password,
            deviceInfo,
        });

        const res = response.body as TSignUpUserResponse;
        const token = res.token;

        const result = await request(app)
            .delete(`/posts/${postId}`)
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(401);
        expect(JSON.stringify(result.body.errors)).toContain(
            "No permission to make this request"
        );
    });

    it("should return a successful response when valid request", async () => {
        const result = await request(app)
            .delete(`/posts/${postId}`)
            .set({ Authorization: `Bearer ${token}` });

        expect(result.statusCode).toEqual(204);
    });
});
