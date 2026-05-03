import React from "react";

import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import TwoLineInCell from "./TwoLineInCell";

const defaultGetValue = ({row, valueName, users}) => {
    let value = row[valueName];

    const user = users.find(u => u.id === row.ui_user_id);
    const userName = user ? user.name : row.ui_user_id;

    if (valueName === "ui_user_id") value = userName;

    if (row.action === "зарплата" && valueName === "note") {
        return TwoLineInCell(userName, row.note);
    }

    if (row.work && row.action !== "расход" && valueName === "item") {
        return TwoLineInCell(row.item, row.work);
    }

    return value ?? "";
};

const InteractionTableRow = ({
    row,
    values,
    users = [],
    onClick,
    className,
    style,
    getValue = defaultGetValue,
    cellKeyPrefix = "interaction-table-row",
}) => <TableRow
    className={className}
    style={style}
    onClick={onClick}
>
    {values.map((valueName, index) => <TableCell
        key={`${cellKeyPrefix}-${row.id || row.item || "row"}-${valueName}-${index}`}
    >
        {getValue({row, valueName, users})}
    </TableCell>)}
</TableRow>;

export default InteractionTableRow;
