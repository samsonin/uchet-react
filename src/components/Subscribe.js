import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from '@material-ui/core/CardActions';
import CardHeader from "@material-ui/core/CardHeader";
import Button from '@material-ui/core/Button';
import {connect} from "react-redux";

// import {Yoo, Tinkoff} from '../images/logos'

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        marginTop: 20,
        height: 290,
        width: 240,
    },
    cardHeader: {
        backgroundColor: theme.palette.grey[200],
    },
    cardBody: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: theme.spacing(2),
    },
    footer: {
        borderTop: `1px solid ${theme.palette.divider}`,
        marginTop: theme.spacing(8),
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        [theme.breakpoints.up('sm')]: {
            paddingTop: theme.spacing(6),
            paddingBottom: theme.spacing(6),
        },
    },
    button: {
        color: '#4aee2f'
    }
}));

const subscribes = [
    {month: 1, monthText: "1 месяц", cost: 3, profit: 0},
    {month: 6, monthText: "6 месяцев", cost: 2, profit: 12},
    {month: 12, monthText: "12 месяцев", cost: 1.5, profit: 18}
];

let dollar = 0;

fetch("https://www.cbr-xml-daily.ru/daily_json.js")
    .then(response => response.json())
    .then(response => dollar = response.Valute.USD.Value)
    .catch(res => console.error(res))

function yandex(org_id, month, cost) {

    if (dollar === 0) return;

    const form = document.createElement('form')
    form.action = "https://yoomoney.ru/quickpay/confirm.xml"
    form.method = "POST"

    const subscribe = subscribes.find(v => v.month === month)

    if (!subscribe) return

    const inputs = [
        {name: "receiver", value: "410012390556672"},
        {name: "quickpay-form", value: "shop"},
        {name: "successURL", value: "https://uchet.store"},
        {name: "targets", value: "Продление подписки в Uchet.store на " + subscribe.monthText},
        {name: "paymentType", value: "AC"},
        {name: "label", value: btoa(JSON.stringify({org_id, action: 'addSubscribe'}))},
        {name: "sum", value: month * cost * dollar}
    ]

    inputs.map(i => {

        const input = document.createElement('input')
        input.type = "hidden"
        input.name = i.name
        input.value = i.value

        form.append(input)

        return i

    })

    document.body.append(form)
    form.submit()

}

const Subscribe = ({organization_id}) => {

    const classes = useStyles();

    function subHeader(profit) {
        return profit > 0 ?
            <span className="text-danger hr-bold">выгода ${profit}</span> :
            <br/>
    }

    return (
        <div>
            <Typography variant="h3" align="center" className="m-3">
                Пожалуйста продлите подписку
            </Typography>
            <Grid container item xs={12} justify="center" className={classes.root} spacing={4}>
                {subscribes.map(v => <Grid key={v.monthText + v.cost} item>
                    <Paper className={classes.paper}>
                        <CardHeader
                            title={v.monthText}
                            subheader={subHeader(v.profit)}
                            titleTypographyProps={{align: 'center'}}
                            subheaderTypographyProps={{align: 'center'}}
                            className={classes.cardHeader}
                        />
                        <CardContent className={classes.cardBody}>
                            <Typography component="h2" variant="h3" color="textPrimary">
                                ${v.cost}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                / месяц
                            </Typography>
                        </CardContent>
                        <CardActions className={classes.cardBody}>
                            <Button variant="outlined"
                                    className={classes.button}
                                    onClick={() => yandex(organization_id, v.month, v.cost)}>
                                Продлить
                            </Button>
                        </CardActions>
                    </Paper>
                </Grid>)}

            </Grid>

            <Grid container>

                <div style={{
                    margin: '1rem',
                }}>
                    <Typography variant="h5" style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        Уважаемые пользователи!
                    </Typography>
                    <Typography variant="body1">
                        В случае невозможности оплатить подписку,
                        Вы можете перевести деньги на карту Сбербанка 4276500031174871 Иван Николаевич С.,
                        в рублях по курсу ЦБ РФ, в комментарии укажите логин для входа в Uchet.store
                    </Typography>
                </div>
            </Grid>

        </div>
    );
}

export default connect(state => state.auth)(Subscribe)