import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import Header from "./Header";
import rootReducer from "../reducers";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("react-router-dom", () => ({
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

jest.mock("./assistant/AssistantChat", () => () => null);

beforeEach(() => {
    window.matchMedia = window.matchMedia || jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
    }));
});

describe("Header", () => {
    it("renders when daily reports are keyed by id", () => {
        const store = createStore(rootReducer, {
            auth: {
                user_id: 7,
                organization_id: 1,
                admin: false,
                expiration_time: Date.now() + 100000,
                position_id: 3,
                time: Date.now(),
            },
            app: {
                current_stock_id: 1,
                positions: [{ id: 3, is_sale: true }],
                stocks: [{ id: 1, name: "Main", is_valid: true }],
                stockusers: [{ user_id: 7, stock_id: 1 }],
                users: [{ id: 7, name: "User" }],
                daily: {
                    12: { stock_id: 1, employees: [7] },
                },
            },
            notif: { notifications: [] },
        });
        const container = document.createElement("div");
        const root = createRoot(container);

        expect(() => {
            act(() => {
                root.render(
                    <Provider store={store}>
                        <Header />
                    </Provider>
                );
            });
        }).not.toThrow();

        act(() => root.unmount());
    });
});
