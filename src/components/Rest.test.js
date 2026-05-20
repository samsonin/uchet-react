import { buildRequestUrl } from "./Rest";

describe("Rest request URL builder", () => {
    it("keeps absolute backend URLs unchanged", () => {
        expect(buildRequestUrl(
            "http://127.0.0.1:8000",
            "http://127.0.0.1:8000/ocr/passport/sessions/7AhQyhfPyMbFHj39"
        )).toBe("http://127.0.0.1:8000/ocr/passport/sessions/7AhQyhfPyMbFHj39");
    });

    it("prefixes relative API paths with the configured base URL", () => {
        expect(buildRequestUrl(
            "http://127.0.0.1:8000",
            "ocr/passport/sessions/7AhQyhfPyMbFHj39"
        )).toBe("http://127.0.0.1:8000/ocr/passport/sessions/7AhQyhfPyMbFHj39");
    });
});
