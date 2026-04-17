import React from "react";

import {Grid} from "@mui/material";
import Button from "@mui/material/Button";

export const BottomButtons =
    (save, cancel, disabled = false, isNew = false) => <Grid
        container
        justify="space-evenly"
        style={{
            margin: '1rem',
            padding: '1rem'
        }}
    >
        <Button
            variant="contained"
            size="small"
            color="secondary"
            onClick={cancel}
            disabled={disabled}
        >
            Отмена
        </Button>
        <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={save}
            disabled={disabled}
        >
            {isNew
                ? 'Создать'
                : 'Сохранить'
            }
        </Button>
    </Grid>
