import React from 'react';
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";


export default function () {

    return <Grid container
                 spacing={2}
                 className="w-100"
    >
        <Grid item xs={12}>
            <Typography variant="h4">
                Интеграция с SMS.RU.
            </Typography>
        </Grid>
        <Grid item xs={12}>
            <Typography variant="body1">
                Интеграция позволяет отправлять заказчикам СМС уведомления, в том числе о готовности заказа.
            </Typography>
            <Typography variant="body1">
                Обращаем Ваше внимание, что с тарифами на отправку SMS вы можете ознакомиться на сайте
                <Link href="https://sms.ru/" target="_blank" className="ml-2">
                    sms.ru
                </Link>
            </Typography>

        </Grid>
        <Grid item xs={12}>
            <Typography variant="body1">1. Зайдите
                <Link href="https://sms.ru/?panel=my" target="_blank" className="ml-2">
                    в личный кабинет sms.ru
                </Link>
            </Typography>
        </Grid>
        <Grid item xs={12}>
            <Typography variant="body1">
                2. Найдите ваш api_id
            </Typography>
        </Grid>
        <Grid item xs={12}>
            <Typography variant="body1">
                3. Скопируйте его и вставьте в поле ниже:
            </Typography>
        </Grid>
        <Grid item xs={12}>
            <TextField className="w-100"
                // value={props.vpbx_api_key}
                       type="password"
                // onChange={(e) => props.keyHandle(e.target.value)}
            />
        </Grid>

    </Grid>

}