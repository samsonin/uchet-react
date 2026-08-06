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
    it("opens update videos inside the application", () => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const root = createRoot(container);

        act(() => {
            root.render(<UpdatesMenu userId={7} />);
        });

        act(() => {
            container.querySelector(".updates-menu-button").click();
        });

        const videoButton = container.querySelector(".updates-action-secondary");

        expect(videoButton.tagName).toBe("BUTTON");

        act(() => {
            videoButton.click();
        });

        expect(document.body.querySelector("video source").getAttribute("src"))
            .toBe("https://f005.backblazeb2.com/file/uchet-store/updates/good-picture-qr.mp4");

        act(() => root.unmount());
    });

    it("shows a friendly message when video storage is unavailable", () => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const root = createRoot(container);

        act(() => {
            root.render(<UpdatesMenu userId={7} />);
        });

        act(() => {
            container.querySelector(".updates-menu-button").click();
        });

        act(() => {
            container.querySelector(".updates-action-secondary").click();
        });

        act(() => {
            document.body.querySelector("video").dispatchEvent(new Event("error"));
        });

        expect(document.body.textContent).toContain("Видео временно недоступно");

        act(() => root.unmount());
    });
});
