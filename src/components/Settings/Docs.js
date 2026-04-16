import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar } from "notistack";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
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

const updateDocShape = (doc, title, text) => ({
    ...doc,
    ...(doc.title !== undefined ? { title } : {}),
    ...(doc.doc_title !== undefined ? { doc_title: title } : {}),
    ...(doc.text !== undefined ? { text } : {}),
    ...(doc.doc_text !== undefined ? { doc_text: text } : {}),
});

const Docs = props => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

    const docs = useMemo(() => getDocsSource(props.app.docs), [props.app.docs]);
    const fields = props.app.fields?.allElements || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [title, setTitle] = useState("");
    const [savedHtml, setSavedHtml] = useState("");
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    const currentDoc = docs[currentIndex] || docs[0];

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
            setDirty(editor.getHTML() !== savedHtml);
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
        if (!editor || !currentDoc) return;

        const text = getDocText(currentDoc);
        const nextTitle = getDocTitle(currentDoc);

        setTitle(nextTitle);
        setSavedHtml(text);
        setDirty(false);
        editor.commands.setContent(text || "", false);
    }, [currentDoc, editor]);

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

        const html = editor.getHTML();

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
                setSavedHtml(html);
                setDirty(false);
                enqueueSnackbar(res.body?.message || "Документ сохранен", { variant: "success" });
                return;
            }

            const fallback = await fallbackSave(currentDoc, html);

            if (fallback?.result || fallback?.ok) {
                updateDocsInStore(currentDoc, html);
                setSavedHtml(html);
                setDirty(false);
                enqueueSnackbar("Документ сохранен", { variant: "success" });
                return;
            }

            enqueueSnackbar(fallback?.message || res.body?.message || "Ошибка сохранения документа", {
                variant: "error",
            });
        } catch (error) {
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
        if (dirty && !window.confirm("Есть несохраненные изменения. Перейти к другому документу?")) {
            return;
        }

        setCurrentIndex(index);
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
        <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
                <Card className={classes.card}>
                    <CardHeader
                        title="Документы"
                        className={classes.cardHeader}
                        titleTypographyProps={{ variant: "h6" }}
                    />
                    <List className={classes.list}>
                        {docs.map((doc, index) => <ListItem
                            button
                            selected={index === currentIndex}
                            onClick={() => selectDoc(index)}
                            key={"settings-doc-" + (getDocId(doc) || index)}
                        >
                            <ListItemText
                                primary={getDocTitle(doc) || getDocName(doc)}
                                secondary={getDocName(doc)}
                            />
                        </ListItem>)}
                    </List>
                </Card>
            </Grid>

            <Grid item xs={12} md={9}>
                <Card className={classes.card}>
                    <CardHeader
                        title="Редактирование документа"
                        subheader={getDocName(currentDoc)}
                        className={classes.cardHeader}
                        titleTypographyProps={{ variant: "h5" }}
                    />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Название"
                                    value={title}
                                    onChange={event => {
                                        setTitle(event.target.value);
                                        setDirty(true);
                                    }}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
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

                                <EditorContent editor={editor} className={classes.editor} />
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
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </div>;
};

export default connect(state => state, mapDispatchToProps)(Docs);
