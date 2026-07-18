const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../..");
const docsSource = fs.readFileSync(path.join(root, "src/components/Settings/Docs.js"), "utf8");

describe("settings docs deep links", () => {
    test("does not rewrite an incoming doc query before selecting the target document", () => {
        expect(docsSource).toContain("if (selectedDocName) return;");
    });
});
