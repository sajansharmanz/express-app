import { user } from "../../const/testData";
import { signToken, decodeToken } from "../../utils/token";

describe("Token utils", () => {
    it("should return jsonwebtoken", () => {
        const token = signToken(user);

        expect(token).toBeDefined();
    });

    it("should verify jsonwebtoken", () => {
        const token = signToken(user);

        const verify = decodeToken(token);

        expect(verify).toHaveProperty("id");
        expect(verify.id).toEqual(user.id);
    });
});
