const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../../..");
const infoSource = fs.readFileSync(path.join(root, "src/components/common/order/Info.js"), "utf8");

describe("order notification document links", () => {
    test("use router links with edit icons instead of imperative history navigation", () => {
        expect(infoSource).toContain('import {Link} from "react-router-dom";');
        expect(infoSource).toContain('import EditIcon from "@mui/icons-material/Edit";');
        expect(infoSource).toContain("component={Link}");
        expect(infoSource).toContain("<EditIcon");
        expect(infoSource).not.toContain("props.history.push(to)");
    });
});
