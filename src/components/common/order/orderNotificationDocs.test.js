import {orderNotificationDocLinks} from "./orderNotificationDocs";

describe("order notification document links", () => {
    test("points new order notification settings to the correct SMS document templates", () => {
        expect(orderNotificationDocLinks).toEqual({
            ready: "/settings/docs?doc=sms",
            acceptance: "/settings/docs?doc=sms_for_messages",
        });
    });
});
