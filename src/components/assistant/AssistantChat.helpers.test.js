import {
    buildAssistantIntro,
    DAILY_QUICK_PROMPTS,
    getDailySectionWalkthrough,
    getDailyAssistantIntro,
    getPageVideoStory,
    resolveQuickPrompts,
} from "./AssistantChat.helpers";

describe("AssistantChat helpers", () => {
    beforeEach(() => {
        window.localStorage.clear();
        jest.useFakeTimers().setSystemTime(new Date("2026-05-17T08:00:00+10:00"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("returns page-specific quick prompts for daily report", () => {
        expect(resolveQuickPrompts("/daily", ["Общий вопрос"])).toEqual(DAILY_QUICK_PROMPTS);
    });

    test("daily intro avoids local example data, role wording, and timing", () => {
        const intro = getDailyAssistantIntro("Софья", {
            current_stock_id: 1,
            stocks: [{ id: 1, name: "Центр" }],
            daily: [{ stock_id: 1 }],
        });

        expect(intro).toContain("Ежедневный отчет");
        expect(intro).toContain("Внизу проверьте итоговые суммы");
        expect(intro).toContain("предзаказов товара или услуги");
        expect(intro).toContain("кнопку «Выйти»");
        expect(intro).not.toMatch(/управляющ|продавц|0:|4543|1450|Первая речка|№31216/i);
    });

    test("daily walkthrough explains each report section", () => {
        const text = getDailySectionWalkthrough();

        expect(text).toContain("Предоплаты");
        expect(text).toContain("/prepaids");
        expect(text).toContain("Товары");
        expect(text).toContain("сканер штрих-кодов");
        expect(text).toContain("Работы, услуги");
        expect(text).toContain("/order");
        expect(text).toContain("Расходы, зарплата");
        expect(text).toContain("Подотчеты");
    });

    test("returns a short video story for daily report page", () => {
        const story = getPageVideoStory("/daily");

        expect(story.title).toBe("Ежедневный отчет");
        expect(story.duration).toBeLessThanOrEqual(45);
        expect(story.scenes).toHaveLength(5);
        expect(story.scenes.map(scene => scene.title)).toEqual([
            "Предоплаты",
            "Товары",
            "Работы, услуги",
            "Расходы, зарплата",
            "Подотчеты",
        ]);
    });

    test("greets once per day and introduces only the first time", () => {
        const first = buildAssistantIntro({
            assistantName: "Софья",
            currentPath: "/daily",
            userId: 7,
            app: { current_stock_id: 0 },
        });
        const second = buildAssistantIntro({
            assistantName: "Софья",
            currentPath: "/daily",
            userId: 7,
            app: { current_stock_id: 0 },
        });

        expect(first).toMatch(/^Здравствуйте, я Софья\./);
        expect(second).not.toContain("Здравствуйте");
        expect(second).not.toContain("я Софья");
    });

    test("greets again on a new day without repeating assistant introduction", () => {
        buildAssistantIntro({
            assistantName: "Софья",
            currentPath: "/daily",
            userId: 7,
            app: { current_stock_id: 0 },
        });

        jest.setSystemTime(new Date("2026-05-18T08:00:00+10:00"));

        const nextDay = buildAssistantIntro({
            assistantName: "Софья",
            currentPath: "/daily",
            userId: 7,
            app: { current_stock_id: 0 },
        });

        expect(nextDay).toMatch(/^Здравствуйте\./);
        expect(nextDay).not.toContain("я Софья");
    });
});
