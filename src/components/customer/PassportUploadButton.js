import React, { useRef, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useSnackbar } from "notistack";

import rest from "../Rest";

const buildIssuedBy = fields => {
    const issuedBy = String(fields.issued_by || "").trim();
    const departmentCode = String(fields.department_code || "").trim();

    if (issuedBy && departmentCode) return `${issuedBy} (${departmentCode})`;
    return issuedBy || departmentCode;
};

const normalizePassportFields = fields => ({
    fio: fields.fio || "",
    birthday: fields.birth_date || "",
    doc_sn: fields.passport_number || "",
    doc_date: fields.issue_date || "",
    doc_division_name: buildIssuedBy(fields),
    address: fields.registration_address || "",
});

export default function PassportUploadButton(props) {
    const inputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const applyPassportData = fields => {
        const nextValues = normalizePassportFields(fields);
        const hasData = Object.values(nextValues).some(Boolean);

        if (!hasData) {
            enqueueSnackbar("Не удалось распознать паспортные данные", {
                variant: "warning",
            });
            return;
        }

        props.setCustomer({
            ...props.customer,
            ...Object.fromEntries(
                Object.entries(nextValues).filter(([, value]) => value)
            ),
        });

        enqueueSnackbar("Паспортные данные загружены", {
            variant: "success",
        });
    };

    const uploadPassport = file => {
        if (!file || isUploading) return;

        setIsUploading(true);

        rest("ocr/passport", "POST", file, true)
            .then(res => {
                if (res.status === 200 && res.body) {
                    applyPassportData(res.body.fields || res.body);
                    return;
                }

                const errorMessage = res.body?.error || "Не удалось загрузить паспорт";
                enqueueSnackbar(errorMessage, {
                    variant: "error",
                });
            })
            .finally(() => {
                setIsUploading(false);
                if (inputRef.current) inputRef.current.value = "";
            });
    };

    if (!props.visible) return null;

    return (
        <div className={`customer-passport-upload ${props.className || ""}`.trim()}>
            <input
                ref={inputRef}
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,.webp,.bmp,.pdf,image/*,application/pdf"
                onChange={e => uploadPassport(e.target.files?.[0])}
            />
            <Button
                variant="outlined"
                color="primary"
                disabled={isUploading}
                startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
                onClick={() => inputRef.current?.click()}
            >
                {isUploading ? "Сканируем паспорт..." : "Сканировать паспорт"}
            </Button>
        </div>
    );
}
