import { isDevelopment, isLive, isTest } from "../../utils/environment";

describe("Environment utils", () => {
    it("should return false for isDevelopment", () => {
        const isDev = isDevelopment();
        expect(isDev).toEqual(false);
    });

    it("should return true for isTest", () => {
        const isDev = isTest();
        expect(isDev).toEqual(true);
    });

    it("should return false for isLive", () => {
        const live = isLive();
        expect(live).toEqual(false);
    });
});
