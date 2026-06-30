import App from "./App";

jest.mock("react-router-dom", () => ({
    Navigate: () => null,
    Route: () => null,
    Routes: ({ children }) => <>{children}</>,
    useLocation: () => ({ pathname: "/" }),
    useNavigate: () => jest.fn(),
    useParams: () => ({}),
}), { virtual: true });

jest.mock("uuid", () => ({
    v4: () => "test-uuid",
}));

jest.mock("./components/Settings/Docs", () => () => null);

jest.mock("notistack", () => ({
    useSnackbar: () => ({
        enqueueSnackbar: jest.fn(),
        closeSnackbar: jest.fn(),
    }),
}));

test("exports app component", () => {
    expect(App).toBeTruthy();
});
