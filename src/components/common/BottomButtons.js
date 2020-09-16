import React from "react";

import {Grid} from "@material-ui/core";
import Button from "@material-ui/core/Button";

export const BottomButtons = (save, cancel, disabled) => <Grid container
      direction="row"
      justify="space-evenly"
      style={{paddingTop: '1rem'}}
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
    Сохранить
  </Button>
</Grid>
