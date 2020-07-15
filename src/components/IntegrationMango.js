import React from 'react';
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import makeStyles from "@material-ui/core/styles/makeStyles";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Input from "@material-ui/core/Input";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    list: {
        width: 200,
        height: 230,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    link: {
        marginRight: 10,
        marginLeft: 10,
    },
    form: {
        weight: '100%',
    },
    input: {
        weight: '100%',
    },
}));

export default function (props) {

    const classes = useStyles();
    const mangoLink = `https://api.uchet.store/mango/${props.org_id}`;

    return <>

        <Grid container spacing={2}>
            <Grid item>
                <Typography variant="h4">
                    Интеграция с облачной АТС Mango-office.
                </Typography>
                <List>
                    <ListItem>
                        <Typography variant="body1">
                            Интеграция с АТС Mango-office позволит записывать и прослушивать разговоры с заказчиками,
                            определять и переводить входящий звонок непосредственно мастеру, который выполняет заказ
                            или мастерской.
                            Интеграция также позволяет уведомлять о готовности заказа с помощью звонка или SMS.
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            Обращаем Ваше внимание, что с тарифами вы можете ознакомиться на сайте
                            <Link href="https://www.mango-office.ru/" target="_blank" className="ml-2">
                                www.mango-office.ru
                            </Link>
                        </Typography>
                    </ListItem>
                </List>
                <Typography variant="h5">
                    Инструкция
                </Typography>
                <List>
                    <ListItem>
                        <Typography variant="body1">1. Зайдите </Typography>
                        <Link href="https://lk.mango-office.ru/400057125/400092440/api-vpbx/connector"
                              target="_blank"
                              className={classes.link}
                        >
                            в личный кабинет Mango-office.
                        </Link>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            2. Перейдите в раздел "Интеграции" => "API коннектор"
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            3. Скопируйте "Уникальный код вашей АТС" и вставьте в поле ниже:
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <TextField className="w-100"
                                   value={props.vpbx_api_key}
                                   type="password"
                                   onChange={e => props.keyHandle(e.target.value)}
                        />
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            4. Скопируйте "Ключ для создания подписи" и вставьте в поле ниже:
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <TextField className="w-100"
                                   value={props.vpbx_api_salt}
                                   type="password"
                                   onChange={e => props.saltHandle(e.target.value)}
                        />
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            5. Разрешить свободный доступ.
                            Выбрать "Соединения по API возможны с любых IP-адресов"
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            6. В поле для адреса внешней системы вставьте следующий адрес:
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <FormControl className="w-100">
                            <Input
                                value={mangoLink}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => navigator.clipboard.writeText(mangoLink)}
                                        >
                                            <FileCopyIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </ListItem>
                </List>
            </Grid>
        </Grid>
    </>

}
