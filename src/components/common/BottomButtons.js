import React from "react";

import {Grid} from "@material-ui/core";
import Button from "@material-ui/core/Button";

export const BottomButtons =
    (save, cancel, disabled = false, isNew = false) => <Grid
        container
        direction="row"
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
