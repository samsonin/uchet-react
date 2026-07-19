const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../..");
const docsSource = fs.readFileSync(path.join(root, "src/components/Settings/Docs.js"), "utf8");

describe("settings docs text-only templates", () => {
    test("treats SMS notification documents as text-only templates", () => {
        expect(docsSource).toContain("textOnlyDocNames");
        expect(docsSource).toContain("\"sms\"");
        expect(docsSource).toContain("\"sms_for_messages\"");
    });

    test("keeps the same variable buttons while hiding the formatting toolbar for text-only templates", () => {
        expect(docsSource).toContain("currentDocIsTextOnly");
        expect(docsSource).toContain("!currentDocIsTextOnly && <div className={classes.toolbar}>");
        expect(docsSource).toContain("EditorContent editor={editor}");
        expect(docsSource).toContain("enableInputRules: !currentDocIsTextOnly");
        expect(docsSource).toContain("enablePasteRules: !currentDocIsTextOnly");
        expect(docsSource).not.toContain("TextareaAutosize");
    });
});
