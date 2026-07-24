import {siteMap} from "./SiteMap";

describe("integration site map", () => {
    test("keeps one SMS phone entry and removes the duplicate Android page", () => {
        const integrations = siteMap(false).filter(item => item.path.startsWith("integration/"));

        expect(integrations).toContainEqual({id: 55, path: "integration/sms-phone", text: "SMS-телефон"});
        expect(integrations.some(item => item.path === "integration/app")).toBe(false);
    });
});
