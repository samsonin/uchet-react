import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import { makeStyles } from "muiLegacyStyles";
import { useSnackbar } from "notistack";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Node, mergeAttributes } from "@tiptap/core";

import { upd_app } from "../../actions/actionCreator";
import rest from "../Rest";
import request from "../Request";

const useStyles = makeStyles({
    root: {
        width: "100%",
        margin: "0.5rem",
    },
    card: {
        marginBottom: 10,
    },
    cardHeader: {
        backgroundColor: "#F7F7F7",
        borderBottom: "1px solid #e9ecef",
    },
    list: {
        maxHeight: "calc(100vh - 180px)",
        overflow: "auto",
    },
    toolbar: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 12,
    },
    variables: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 12,
    },
    editor: {
        border: "1px solid #d9dfe7",
        borderRadius: 4,
        minHeight: 440,
        padding: 14,
        background: "#fff",
        "& .ProseMirror": {
            minHeight: 410,
            outline: "none",
        },
        "& table": {
            borderCollapse: "collapse",
            width: "100%",
        },
        "& td, & th": {
            border: "1px solid #999",
            padding: 4,
        },
        "& input[type='button']": {
            border: "1px solid #9aa7b5",
            borderRadius: 4,
            background: "#eef3f8",
            color: "#263238",
            padding: "2px 6px",
            margin: "0 2px",
        },
    },
    previewPaper: {
        background: "#eef2f5",
    },
    previewControls: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 16,
    },
    previewControl: {
        minWidth: 170,
    },
    previewViewport: {
        overflow: "auto",
        padding: "10px 0 22px",
    },
    previewPage: {
        margin: "0 auto",
        padding: "18mm",
        background: "#fff",
        color: "#111827",
        boxShadow: "0 18px 42px rgba(28, 43, 54, 0.18)",
        "& table": {
            width: "100%",
            borderCollapse: "collapse",
        },
        "& td, & th": {
            border: "1px solid #999",
            padding: 4,
        },
        "& p": {
            marginTop: 0,
        },
    },
});

const TemplateVariable = Node.create({
    name: "templateVariable",
    group: "inline",
    inline: true,
    atom: true,

    addAttributes() {
        return {
            name: {
                default: "",
                parseHTML: element => element.getAttribute("name") || "",
            },
            value: {
                default: "",
                parseHTML: element => element.getAttribute("value") || "",
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "input[type='button']",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["input", mergeAttributes(HTMLAttributes, { type: "button" })];
    },
});

const mapDispatchToProps = dispatch => bindActionCreators({
    upd_app
}, dispatch);

const getDocsSource = appDocs => Array.isArray(appDocs)
    ? appDocs
    : appDocs?.docs || [];

const getDocId = doc => doc?.id;
const getDocName = doc => doc?.name || doc?.doc_name || "";
const getDocTitle = doc => doc?.title || doc?.doc_title || "";
const getDocText = doc => doc?.text || doc?.doc_text || "";
const internalDocNames = new Set(["remont", "buy", "checkout"]);

const previewPaperSizes = {
    a4: {
        label: "A4",
        portrait: { width: "210mm", minHeight: "297mm", printSize: "A4 portrait" },
        landscape: { width: "297mm", minHeight: "210mm", printSize: "A4 landscape" },
    },
    a5: {
        label: "A5",
        portrait: { width: "148mm", minHeight: "210mm", printSize: "A5 portrait" },
        landscape: { width: "210mm", minHeight: "148mm", printSize: "A5 landscape" },
    },
};

const getDocDisplayTitle = (doc, index = 0) => {
    const title = getDocTitle(doc).trim();
    const name = getDocName(doc).trim().toLowerCase();

    if (title && !internalDocNames.has(title.toLowerCase())) return title;
    if (name && !internalDocNames.has(name)) return name;

    return `Шаблон документа ${index + 1}`;
};

const getMockValue = name => {
    const key = (name || "").toLowerCase();

    if (key.includes("date") || key.includes("дата")) return "17.04.2026";
    if (key.includes("time") || key.includes("время")) return "14:30";
    if (key.includes("phone") || key.includes("тел")) return "+7 999 123-45-67";
    if (key.includes("email") || key.includes("mail")) return "client@example.com";
    if (key.includes("client") || key.includes("customer") || key.includes("клиент")) return "Иванов Иван Иванович";
    if (key.includes("user") || key.includes("master") || key.includes("сотруд") || key.includes("мастер")) return "Петров Петр";
    if (key.includes("org") || key.includes("organization") || key.includes("орган")) return "ООО \"Учет\"";
    if (key.includes("address") || key.includes("адрес")) return "г. Владивосток, ул. Светланская, 10";
    if (key.includes("sum") || key.includes("price") || key.includes("cost") || key.includes("сум") || key.includes("цен")) return "12 500 ₽";
    if (key.includes("number") || key.includes("num") || key.includes("номер")) return "000123";
    if (key.includes("barcode") || key.includes("\u0448\u0442\u0440\u0438\u0445")) return "112116021526";
    if (key.includes("imei")) return "356789012345678";
    if (key.includes("model") || key.includes("goods") || key.includes("товар") || key.includes("модель")) return "iPhone 13";

    return "Тестовое значение";
};

const updateDocShape = (doc, title, text) => ({
    ...doc,
    ...(doc.title !== undefined ? { title } : {}),
    ...(doc.doc_title !== undefined ? { doc_title: title } : {}),
    ...(doc.text !== undefined ? { text } : {}),
    ...(doc.doc_text !== undefined ? { doc_text: text } : {}),
});

const normalizeEditorHtml = html => (html || "").trim();
const normalizeDocToken = value => (value || "").trim().toLowerCase();
const DOC_EDITOR_TITLE = String.fromCharCode(1056,1077,1076,1072,1082,1090,1080,1088,1086,1074,1072,1085,1080,1077,32,1076,1086,1082,1091,1084,1077,1085,1090,1072);
const DOC_LABEL = String.fromCharCode(1044,1086,1082,1091,1084,1077,1085,1090);

const Docs = props => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

    const docs = useMemo(() => getDocsSource(props.app.docs), [props.app.docs]);
    const selectedDocName = new URLSearchParams(props.location?.search || "").get("doc") || "";
    const fields = props.app.fields?.allElements || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [title, setTitle] = useState("");
    const [savedTitle, setSavedTitle] = useState("");
    const [savedHtml, setSavedHtml] = useState("");
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState("");
    const [previewPaper, setPreviewPaper] = useState("a4");
    const [previewOrientation, setPreviewOrientation] = useState("portrait");

    const currentDoc = docs[currentIndex] || docs[0];

    const syncDirty = (nextTitle = title, nextHtml = editor?.getHTML() || "") => {
        setDirty(
            normalizeEditorHtml(nextHtml) !== savedHtml ||
            nextTitle.trim() !== savedTitle.trim()
        );
    };

    const buildDocSearch = docName => {
        const params = new URLSearchParams(props.location?.search || "");

        if (docName) params.set("doc", docName);
        else params.delete("doc");

        const query = params.toString();
        return query ? `?${query}` : "";
    };

    const replaceDocSearch = docName => {
        const nextSearch = buildDocSearch(docName);
        const currentSearch = props.location?.search || "";

        if (nextSearch !== currentSearch) {
            props.history.replace({
                pathname: props.location?.pathname || "/settings/docs",
                search: nextSearch,
            });
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TemplateVariable,
        ],
        content: "",
        onUpdate: ({ editor }) => {
            syncDirty(title, editor.getHTML());
        },
    });

    useEffect(() => {
        if (!docs.length) {
            setCurrentIndex(0);
            return;
        }

        if (!docs[currentIndex]) {
            setCurrentIndex(0);
        }
    }, [currentIndex, docs]);

    useEffect(() => {
        if (!docs.length || !selectedDocName) return;

        const normalizedName = normalizeDocToken(selectedDocName);
        const targetIndex = docs.findIndex(doc => {
            const name = normalizeDocToken(getDocName(doc));
            const title = normalizeDocToken(getDocTitle(doc));

            return name === normalizedName || title === normalizedName;
        });

        if (targetIndex >= 0 && targetIndex !== currentIndex) {
            setCurrentIndex(targetIndex);
        }
    }, [currentIndex, docs, selectedDocName]);

    useEffect(() => {
        if (!editor || !currentDoc) return;

        const text = getDocText(currentDoc);
        const nextTitle = getDocTitle(currentDoc);

        editor.commands.setContent(text || "", false);
        const nextHtml = normalizeEditorHtml(editor.getHTML());

        setTitle(nextTitle);
        setSavedTitle(nextTitle);
        setSavedHtml(nextHtml);
        setDirty(false);
    }, [currentDoc, editor]);

    useEffect(() => {
        if (!docs.length || !currentDoc) return;

        replaceDocSearch(getDocName(currentDoc));
    }, [currentDoc, docs.length]);

    const updateDocsInStore = (nextDoc, html) => {
        const nextDocs = docs.map((doc, index) => index === currentIndex
            ? updateDocShape(nextDoc, title.trim(), html)
            : doc
        );

        const source = props.app.docs;

        props.upd_app({
            docs: Array.isArray(source)
                ? nextDocs
                : { ...source, docs: nextDocs }
        });
    };

    const fallbackSave = (doc, html) => request({
        action: "saveDoc",
        name: getDocName(doc),
        text: html,
    }, "/settings", props.auth.jwt);

    const saveDoc = async () => {
        if (!editor || !currentDoc) return;

        const html = normalizeEditorHtml(editor.getHTML());

        if (!html || html === "<p></p>") {
            enqueueSnackbar("Документ пустой", { variant: "error" });
            return;
        }

        setSaving(true);

        try {
            const id = getDocId(currentDoc);
            const res = id
                ? await rest("docs/" + id, "PATCH", {
                    name: getDocName(currentDoc),
                    title: title.trim(),
                    text: html,
                })
                : { status: 404 };

            if (res.status >= 200 && res.status < 300 && res.body?.ok !== false) {
                updateDocsInStore(currentDoc, html);
                setSavedTitle(title.trim());
                setSavedHtml(html);
                setDirty(false);
                enqueueSnackbar(res.body?.message || "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d", { variant: "success" });
                return;
            }

            const fallback = await fallbackSave(currentDoc, html);

            if (fallback?.result || fallback?.ok) {
                updateDocsInStore(currentDoc, html);
                setSavedTitle(title.trim());
                setSavedHtml(html);
                setDirty(false);
                enqueueSnackbar("\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d", { variant: "success" });
                return;
            }

            enqueueSnackbar(fallback?.message || res.body?.message || "\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430", {
                variant: "error",
            });
            enqueueSnackbar("Ошибка сети", { variant: "error" });
        } finally {
            setSaving(false);
        }
    };

    const insertVariable = field => {
        if (!editor) return;

        editor
            .chain()
            .focus()
            .insertContent({
                type: "templateVariable",
                attrs: {
                    name: field.name,
                    value: field.value || field.name,
                },
            })
            .run();
    };

    const selectDoc = index => {
        if (dirty) {
            enqueueSnackbar("\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u0438\u043b\u0438 \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u0432 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0435", { variant: "warning" });
            return;
        }

        const nextDoc = docs[index];
        if (nextDoc) {
            replaceDocSearch(getDocName(nextDoc));
        }

        setCurrentIndex(index);
    };

    const buildPreviewHtml = html => {
        const div = document.createElement("div");
        div.innerHTML = html || "";

        div.querySelectorAll("input[type='button']").forEach(input => {
            const span = document.createElement("span");
            const name = input.getAttribute("name") || "";
            span.innerHTML = getMockValue(name);
            input.parentNode.replaceChild(span, input);
        });

        return div.innerHTML;
    };

    const openPreview = () => {
        if (!editor) return;

        setPreviewHtml(buildPreviewHtml(editor.getHTML()));
        setPreviewOpen(true);
    };

    const printPreview = () => window.print();

    const currentPaperSize = previewPaperSizes[previewPaper][previewOrientation];
    const previewPageStyle = {
        width: currentPaperSize.width,
        minHeight: currentPaperSize.minHeight,
    };

    if (!docs.length) {
        return <div className={classes.root}>
            <Card className={classes.card}>
                <CardHeader
                    title="Документы"
                    className={classes.cardHeader}
                    titleTypographyProps={{ variant: "h5" }}
                />
                <CardContent>
                    <Typography>Документы еще не загружены.</Typography>
                </CardContent>
            </Card>
        </div>;
    }

    return <div className={classes.root}>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card className={classes.card}>
                    <CardHeader
                        title={DOC_EDITOR_TITLE}
                        className={classes.cardHeader}
                        titleTypographyProps={{ variant: "h5" }}
                    />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined" size="small">
                                    <InputLabel id="docs-select-label">{DOC_LABEL}</InputLabel>
                                    <Select
                                        labelId="docs-select-label"
                                        value={currentIndex}
                                        label={DOC_LABEL}
                                        onChange={event => selectDoc(Number(event.target.value))}
                                    >
                                        {docs.map((doc, index) => <MenuItem
                                            key={"settings-doc-" + (getDocId(doc) || index)}
                                            value={index}
                                        >
                                            {getDocDisplayTitle(doc, index)}
                                        </MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <div className={classes.toolbar}>
                                    <ButtonGroup size="small" variant="outlined">
                                        <Button onClick={() => editor?.chain().focus().toggleBold().run()}>B</Button>
                                        <Button onClick={() => editor?.chain().focus().toggleItalic().run()}>I</Button>
                                        <Button onClick={() => editor?.chain().focus().toggleUnderline().run()}>U</Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="small" variant="outlined">
                                        <Button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
                                        <Button onClick={() => editor?.chain().focus().toggleBulletList().run()}>Список</Button>
                                        <Button onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1.2.</Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="small" variant="outlined">
                                        <Button onClick={() => editor?.chain().focus().setTextAlign("left").run()}>Лево</Button>
                                        <Button onClick={() => editor?.chain().focus().setTextAlign("center").run()}>Центр</Button>
                                        <Button onClick={() => editor?.chain().focus().setTextAlign("right").run()}>Право</Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="small" variant="outlined">
                                        <Button onClick={() => editor?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}>
                                            Таблица
                                        </Button>
                                        <Button onClick={() => editor?.chain().focus().addRowAfter().run()}>+ строка</Button>
                                        <Button onClick={() => editor?.chain().focus().addColumnAfter().run()}>+ колонка</Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="small" variant="outlined">
                                        <Button onClick={() => editor?.chain().focus().undo().run()}>Назад</Button>
                                        <Button onClick={() => editor?.chain().focus().redo().run()}>Вперед</Button>
                                    </ButtonGroup>
                                </div>

                                <EditorContent editor={editor} className={`${classes.editor} docs-editor`} />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2">Переменные</Typography>
                                <div className={classes.variables}>
                                    {fields
                                        .filter(field => field.is_valid !== false)
                                        .map(field => <Button
                                            key={"settings-doc-field-" + field.id}
                                            size="small"
                                            variant="outlined"
                                            onMouseDown={event => event.preventDefault()}
                                            onClick={() => insertVariable(field)}
                                        >
                                            {field.value || field.name}
                                        </Button>)}
                                </div>
                            </Grid>
                        </Grid>

                        <Divider style={{ margin: "16px 0" }} />

                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!dirty || saving}
                            onClick={saveDoc}
                        >
                            Сохранить
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={openPreview}
                            style={{ marginLeft: 8 }}
                        >
                            Предварительный просмотр
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        <Dialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            maxWidth="lg"
            fullWidth
            slotProps={{ paper: { className: `${classes.previewPaper} docs-preview-paper` } }}
        >
            <style>
                {`@media print { @page { size: ${currentPaperSize.printSize}; margin: 0; } }`}
            </style>
            <DialogTitle className="non-printable">
                Предварительный просмотр печати
            </DialogTitle>
            <DialogContent>
                <div className={`${classes.previewControls} non-printable`}>
                    <FormControl variant="outlined" size="small" className={classes.previewControl}>
                        <InputLabel id="preview-paper-label">Размер бумаги</InputLabel>
                        <Select
                            labelId="preview-paper-label"
                            value={previewPaper}
                            onChange={event => setPreviewPaper(event.target.value)}
                            label="Размер бумаги"
                        >
                            {Object.entries(previewPaperSizes).map(([value, config]) => <MenuItem
                                key={"preview-paper-" + value}
                                value={value}
                            >
                                {config.label}
                            </MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small" className={classes.previewControl}>
                        <InputLabel id="preview-orientation-label">Расположение</InputLabel>
                        <Select
                            labelId="preview-orientation-label"
                            value={previewOrientation}
                            onChange={event => setPreviewOrientation(event.target.value)}
                            label="Расположение"
                        >
                            <MenuItem value="portrait">Книжная</MenuItem>
                            <MenuItem value="landscape">Альбомная</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div className={classes.previewViewport}>
                    <div
                        className={`${classes.previewPage} docs-print-page`}
                        style={previewPageStyle}
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                </div>
            </DialogContent>
            <DialogActions className="non-printable">
                <Button color="primary" variant="contained" onClick={printPreview}>
                    Печать
                </Button>
                <Button onClick={() => setPreviewOpen(false)}>
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    </div>;
};

export default connect(state => state, mapDispatchToProps)(Docs);
