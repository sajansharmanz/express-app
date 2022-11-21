import { hashPassword, validatePassword } from "../../utils/password";

describe("Password utils", () => {
    it("should return a hashed password", async () => {
        const password = "mypassword";
        const hashedPassword = await hashPassword(password);

        expect(password).not.toEqual(hashedPassword);
    });

    it("should return false if the password passed does not match the hashed password of original password", async () => {
        const originalPassword = "mypassword";
        const hashedPassword = await hashPassword(originalPassword);
        const notMatchingOriginalPassword = "notmatchingpassword";

        const result = await validatePassword(
            notMatchingOriginalPassword,
            hashedPassword
        );

        expect(result).toEqual(false);
    });

    it("should return true if the password passed does match the hashed password of original password", async () => {
        const originalPassword = "mypassword";
        const hashedPassword = await hashPassword(originalPassword);

        const result = await validatePassword(originalPassword, hashedPassword);

        expect(result).toEqual(true);
    });
});
