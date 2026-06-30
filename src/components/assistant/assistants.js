import sofiaAvatar from "../../images/assistant-sofia-optimized.jpg";
import alexanderAvatar from "../../images/assistant-alexander-optimized.jpg";

export const ASSISTANTS = {
    female: {
        id: "sofia",
        name: "Софья",
        gender: "female",
        age: 25,
        avatar: sofiaAvatar,
        title: "Ваш помощник",
    },
    male: {
        id: "alexander",
        name: "Александр",
        gender: "male",
        age: 25,
        avatar: alexanderAvatar,
        title: "Ваш помощник",
    },
};

const MALE_NAMES = new Set([
    "александр", "алексей", "андрей", "антон", "артем", "богдан", "борис", "вадим",
    "валентин", "валерий", "василий", "виктор", "виталий", "владимир", "владислав",
    "вячеслав", "геннадий", "георгий", "григорий", "даниил", "денис", "дмитрий",
    "евгений", "егор", "иван", "игорь", "илья", "кирилл", "константин", "лев",
    "леонид", "максим", "матвей", "михаил", "никита", "николай", "олег", "павел",
    "петр", "роман", "руслан", "сергей", "станислав", "степан", "тимофей", "юрий",
    "ярослав",
]);

const FEMALE_NAMES = new Set([
    "александра", "алена", "алина", "алиса", "анастасия", "ангелина", "анна",
    "валерия", "вера", "вероника", "виктория", "дарья", "евгения", "екатерина",
    "елена", "елизавета", "ирина", "карина", "кристина", "ксения", "любовь",
    "маргарита", "марина", "мария", "наталья", "нина", "ольга", "полина",
    "светлана", "софья", "софия", "татьяна", "юлия", "яна",
]);

const normalizeName = value => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/\s+/)[0]
    .replace(/[^a-zа-я-]/g, "");

export const detectUserGenderByName = name => {
    const firstName = normalizeName(name);

    if (!firstName) return "unknown";
    if (MALE_NAMES.has(firstName)) return "male";
    if (FEMALE_NAMES.has(firstName)) return "female";

    if (firstName.endsWith("ич")) return "male";
    if (firstName.endsWith("на")) return "female";
    if (/[ая]$/.test(firstName)) return "female";
    if (/[бвгджзклмнпрстфхцчшщй]$/.test(firstName)) return "male";

    return "unknown";
};

export const getAssistantForUserName = name => {
    const gender = detectUserGenderByName(name);

    if (gender === "female") return ASSISTANTS.male;

    return ASSISTANTS.female;
};
