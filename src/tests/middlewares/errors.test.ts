import request = require("supertest");

import {
    AccountLockedError,
    AuthenticationError,
    GeneralError,
    InternalServerError,
    InvalidTokenError,
    NotFoundError,
    PermissionError,
    ValidationError,
} from "../../errors";

import { app } from "../../app";

describe("Errors are generated correctly", () => {
    it("should generate GeneralError correctly", () => {
        const errorStatus = 500;
        const errorMessage = "Error message";
        const error = new GeneralError(errorStatus, errorMessage);

        expect(error.statusCode).toEqual(errorStatus);
        expect(error.message).toEqual(errorMessage);
        expect(error.serializeErrors()).toHaveLength(1);
    });

    it("should generate NotFoundError correctly", () => {
        const errorMessage = "Error message";
        const error = new NotFoundError(errorMessage);

        expect(error.statusCode).toEqual(404);
        expect(error.message).toEqual(errorMessage);
        expect(error.serializeErrors()).toHaveLength(1);
        expect(JSON.stringify(error.serializeErrors())).toContain(errorMessage);
    });

    it("should generate InternalServerError correctly", () => {
        const errorMessage = "Error message";
        const error = new InternalServerError(errorMessage);

        expect(error.statusCode).toEqual(500);
        expect(error.message).toEqual(errorMessage);
        expect(error.serializeErrors()).toHaveLength(1);
        expect(JSON.stringify(error.serializeErrors()).toLowerCase()).toContain(
            "internal server error"
        );
    });

    it("should generate ValidationError correctly", () => {
        const errors = [{ message: "error 1" }, { message: "error 2" }];
        const error = new ValidationError(errors);

        expect(error.statusCode).toEqual(400);
        expect(error.message.toLowerCase()).toEqual(
            `validation errors: ${JSON.stringify(errors).toLowerCase()}`
        );
        expect(error.serializeErrors()).toHaveLength(2);
        expect(JSON.stringify(error.serializeErrors()).toLowerCase()).toContain(
            "error 1"
        );
        expect(JSON.stringify(error.serializeErrors()).toLowerCase()).toContain(
            "error 2"
        );
    });

    it("should generate AuthenticationError correctly", () => {
        const error = new AuthenticationError();

        expect(error.statusCode).toEqual(401);
        expect(error.message.toLowerCase()).toEqual("authentication error");
        expect(error.serializeErrors()).toHaveLength(1);
        expect(JSON.stringify(error.serializeErrors()).toLowerCase()).toContain(
            "authentication error"
        );
    });

    it("should generate AccountLockedError correctly", () => {
        const error = new AccountLockedError();

        expect(error.statusCode).toEqual(401);
        expect(error.message.toLowerCase()).toEqual("account locked");
        expect(error.serializeErrors()).toHaveLength(1);
        expect(JSON.stringify(error.serializeErrors()).toLowerCase()).toContain(
            "account locked"
        );
    });

    it("should generate InvalidTokenError correctly", () => {
        const error = new InvalidTokenError();

        expect(error.statusCode).toEqual(401);
        expect(error.message.toLowerCase()).toEqual("please login to continue");
        expect(error.serializeErrors()).toHaveLength(1);
        expect(JSON.stringify(error.serializeErrors()).toLowerCase()).toContain(
            "please login to continue"
        );
    });

    it("should generate PermissionError correctly", () => {
        const error = new PermissionError();

        expect(error.statusCode).toEqual(401);
        expect(error.message.toLowerCase()).toEqual(
            "no permission to make this request"
        );
        expect(error.serializeErrors()).toHaveLength(1);
        expect(JSON.stringify(error.serializeErrors()).toLowerCase()).toContain(
            "no permission to make this request"
        );
    });
});

describe("Error handler captures and returns correct values", () => {
    it("should return a NotFoundError when an endpoint that does not exist is requested", async () => {
        const result = await request(app).get("/pathdoesnotexist");

        expect(result.statusCode).toEqual(404);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "the request get /pathdoesnotexist was not found"
        );
    });

    it("should return an InternalServerError", async () => {
        const result = await request(app).get("/internalservererror");

        expect(result.statusCode).toEqual(500);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(1);
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "internal server error"
        );
    });

    it("should return a ValidationError", async () => {
        const result = await request(app).get("/validationerror");

        expect(result.statusCode).toEqual(400);
        expect(result.body).toHaveProperty("errors");
        expect(result.body.errors).toHaveLength(2);
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "test1"
        );
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "test2"
        );
    });

    it("should return a AuthenticationError", async () => {
        const result = await request(app).get("/authenticationerror");

        expect(result.statusCode).toEqual(401);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "authentication error"
        );
    });

    it("should return a AccountLockedError", async () => {
        const result = await request(app).get("/accountlockederror");

        expect(result.statusCode).toEqual(401);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "account locked"
        );
    });

    it("should return a InvalidTokenError", async () => {
        const result = await request(app).get("/invalidtokenerror");

        expect(result.statusCode).toEqual(401);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "please login to continue"
        );
    });

    it("should return a PermissionError", async () => {
        const result = await request(app).get("/permissionerror");

        expect(result.statusCode).toEqual(401);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "no permission to make this request"
        );
    });

    it("should return a GeneralError", async () => {
        const result = await request(app).get("/generalerror");

        expect(result.statusCode).toEqual(500);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "general error"
        );
    });

    it("should return a default response for error types not declared", async () => {
        const result = await request(app).get("/randomerror");

        expect(result.statusCode).toEqual(500);
        expect(result.body).toHaveProperty("errors");
        expect(JSON.stringify(result.body.errors).toLowerCase()).toContain(
            "something went wrong"
        );
    });
});
