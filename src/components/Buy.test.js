import { createDailyAfterPrintHandler } from "./Buy.helpers";

describe("Buy helpers", () => {
    it("creates a daily navigation callback without navigating immediately", () => {
        const history = { push: jest.fn() };

        const afterPrint = createDailyAfterPrintHandler(history);

        expect(history.push).not.toHaveBeenCalled();

        afterPrint();

        expect(history.push).toHaveBeenCalledWith("/daily");
    });
});
