import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

import UpdatesMenu from "./UpdatesMenu";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("react-router-dom", () => ({
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

beforeEach(() => {
    window.localStorage.clear();
});

afterEach(() => {
    document.body.innerHTML = "";
});

describe("UpdatesMenu", () => {
    it("opens update videos in a separate tab", () => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const root = createRoot(container);

        act(() => {
            root.render(<UpdatesMenu userId={7} />);
        });

        act(() => {
            container.querySelector(".updates-menu-button").click();
        });

        const videoLink = container.querySelector(".updates-action-secondary");

        expect(videoLink.tagName).toBe("A");
        expect(videoLink.getAttribute("href")).toBe("https://f005.backblazeb2.com/file/uchet-store/updates/good-picture-qr.mp4");
        expect(videoLink.getAttribute("target")).toBe("_blank");
        expect(videoLink.getAttribute("rel")).toBe("noopener noreferrer");

        act(() => root.unmount());
    });
});
