const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const pledgeSource = fs.readFileSync(path.join(root, "src/components/Pledge.js"), "utf8");
const appStyles = fs.readFileSync(path.join(root, "src/index.css"), "utf8");

describe("pledge styles", () => {
    it("keeps disabled pledge fields readable in dark theme", () => {
        expect(pledgeSource).toContain("pledge-page");
        expect(appStyles).toContain(":root[data-theme=\"dark\"] .pledge-page .MuiInputBase-input.Mui-disabled");
        expect(appStyles).toContain(":root[data-theme=\"dark\"] .pledge-page input:disabled");
        expect(appStyles).toContain("-webkit-text-fill-color: var(--text)");
    });
});
