import React from 'react';
import { makeStyles } from 'muiLegacyStyles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CardContent from "@mui/material/CardContent";
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import { connect } from "react-redux";
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';


const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    heading: {
        margin: theme.spacing(4, 2, 1),
        textAlign: 'center',
    },
    subheading: {
        margin: theme.spacing(0, 2, 4),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    paper: {
        marginTop: 20,
        minHeight: 420,
        width: 280,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
            borderColor: 'rgba(15, 159, 143, 0.22)',
        }
    },
    paperFeatured: {
        position: 'relative',
        borderColor: 'rgba(15, 159, 143, 0.42)',
        boxShadow: '0 24px 54px rgba(15, 159, 143, 0.16)',
    },
    cardHeader: {
        padding: theme.spacing(3, 3, 2),
        background: 'linear-gradient(180deg, rgba(15, 159, 143, 0.08) 0%, rgba(255,255,255,1) 100%)',
    },
    cardHeaderFeatured: {
        background: 'linear-gradient(180deg, rgba(15, 159, 143, 0.18) 0%, rgba(255,255,255,1) 100%)',
    },
    badges: {
        display: 'flex',
        justifyContent: 'center',
        gap: theme.spacing(1),
        marginBottom: theme.spacing(2),
        flexWrap: 'wrap',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(0.5, 1.25),
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.2,
        backgroundColor: 'rgba(15, 23, 42, 0.06)',
        color: '#0f172a',
    },
    badgeAccent: {
        backgroundColor: '#0f9f8f',
        color: '#fff',
    },
    planTitle: {
        textAlign: 'center',
        fontWeight: 700,
    },
    planSubtitle: {
        textAlign: 'center',
        marginTop: theme.spacing(1),
        color: theme.palette.text.secondary,
    },
    cardBody: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: theme.spacing(1),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    oldPrice: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        textDecoration: 'line-through',
        minHeight: 24,
    },
    total: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: theme.spacing(1),
        paddingTop: 0,
        paddingBottom: theme.spacing(1),
    },
    totalText: {
        fontWeight: 600,
    },
    savingsBlock: {
        margin: theme.spacing(0, 3, 2),
        padding: theme.spacing(1.5, 2),
        borderRadius: 14,
        backgroundColor: 'rgba(15, 159, 143, 0.08)',
        color: '#0f5e55',
        textAlign: 'center',
    },
    savingsText: {
        fontWeight: 700,
    },
    savingsHint: {
        marginTop: theme.spacing(0.5),
        color: 'rgba(15, 94, 85, 0.82)',
        fontSize: 13,
    },
    featureList: {
        margin: theme.spacing(0, 3, 2),
        display: 'grid',
        gap: theme.spacing(1),
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        color: theme.palette.text.secondary,
        fontSize: 14,
    },
    featureDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#0f9f8f',
        flexShrink: 0,
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 'auto',
        padding: theme.spacing(0, 3, 3),
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
        width: '100%',
        minHeight: 46,
        borderRadius: 12,
        color: '#0f9f8f',
        borderColor: 'rgba(15, 159, 143, 0.36)',
        fontWeight: 700,
    },
    buttonFeatured: {
        color: '#fff',
        backgroundColor: '#0f9f8f',
        borderColor: '#0f9f8f',
        '&:hover': {
            backgroundColor: '#0c8779',
            borderColor: '#0c8779',
        }
    },
    supportWrap: {
        display: 'flex',
        justifyContent: 'center',
        margin: theme.spacing(5, 2, 2),
    },
    supportCard: {
        maxWidth: 720,
        width: '100%',
        padding: theme.spacing(3, 3.5),
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(15, 159, 143, 0.08) 0%, rgba(15, 23, 42, 0.03) 100%)',
        border: '1px solid rgba(15, 159, 143, 0.14)',
        textAlign: 'center',
    },
    supportTitle: {
        fontWeight: 700,
        marginBottom: theme.spacing(1),
    },
    supportText: {
        color: theme.palette.text.secondary,
        marginBottom: theme.spacing(2.5),
    },
    supportLink: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        padding: theme.spacing(1.25, 2.5),
        borderRadius: 999,
        textDecoration: 'none',
        fontWeight: 700,
        color: '#0f9f8f',
        backgroundColor: '#fff',
        border: '1px solid rgba(15, 159, 143, 0.18)',
        boxShadow: '0 10px 24px rgba(15, 159, 143, 0.08)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        '&:hover': {
            textDecoration: 'none',
            transform: 'translateY(-1px)',
            borderColor: 'rgba(15, 159, 143, 0.3)',
            boxShadow: '0 14px 28px rgba(15, 159, 143, 0.12)',
        }
    }
}));

const currencies = {
    RUB: {
        code: "RUB",
        locale: "ru-RU",
        perMonthLabel: "руб. / месяц",
        totalLabel: "Итого",
    },
};

const defaultCurrency = "RUB";

const subscribes = [
    { month: 1, monthText: "1 месяц", prices: { RUB: 299 } },
    { month: 6, monthText: "6 месяцев", prices: { RUB: 199 }, badge: "Популярный", note: "Оптимальный баланс цены и срока" },
    { month: 12, monthText: "12 месяцев", prices: { RUB: 159 }, badge: "Лучшая цена", note: "Максимальная выгода для постоянной работы" }
];

const getMonthlyPrice = (subscribe, currencyCode = defaultCurrency) => subscribe.prices?.[currencyCode] ?? null;

const getTotalPrice = (subscribe, currencyCode = defaultCurrency) => {
    const monthlyPrice = getMonthlyPrice(subscribe, currencyCode);
    return monthlyPrice === null ? null : monthlyPrice * subscribe.month;
};

const formatMoney = (amount, currencyCode = defaultCurrency) => {
    if (amount === null) return "";

    const currency = currencies[currencyCode];

    return new Intl.NumberFormat(currency?.locale || "ru-RU").format(amount);
};

const getBaseMonthlyPrice = currencyCode => getMonthlyPrice(subscribes.find(v => v.month === 1), currencyCode);

const getMonthlySavings = (subscribe, currencyCode = defaultCurrency) => {
    const basePrice = getBaseMonthlyPrice(currencyCode);
    const monthlyPrice = getMonthlyPrice(subscribe, currencyCode);

    if (basePrice === null || monthlyPrice === null) return 0;

    return Math.max(0, basePrice - monthlyPrice);
};

const getTotalSavings = (subscribe, currencyCode = defaultCurrency) => getMonthlySavings(subscribe, currencyCode) * subscribe.month;

const getDiscountPercent = (subscribe, currencyCode = defaultCurrency) => {
    const basePrice = getBaseMonthlyPrice(currencyCode);
    const monthlySavings = getMonthlySavings(subscribe, currencyCode);

    if (!basePrice || monthlySavings <= 0) return 0;

    return Math.round((monthlySavings / basePrice) * 100);
};

function yandex(org_id, month, currencyCode = defaultCurrency) {

    const form = document.createElement('form')
    form.action = "https://yoomoney.ru/quickpay/confirm.xml"
    form.method = "POST"

    const subscribe = subscribes.find(v => v.month === month)
    const total = subscribe ? getTotalPrice(subscribe, currencyCode) : null;

    if (!subscribe || total === null) return

    const inputs = [
        { name: "receiver", value: "410012390556672" },
        { name: "quickpay-form", value: "shop" },
        { name: "successURL", value: "https://uchet.store" },
        { name: "targets", value: "Продление подписки в Uchet.store на " + subscribe.monthText },
        { name: "paymentType", value: "AC" },
        { name: "label", value: btoa(JSON.stringify({ org_id, action: 'addSubscribe', currency: currencyCode })) },
        { name: "sum", value: total }
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

const Subscribe = ({ organization_id }) => {

    const classes = useStyles();
    const activeCurrency = defaultCurrency;
    const activeCurrencyMeta = currencies[activeCurrency];

    return (
        <div>
            <Typography variant="h3" className={classes.heading}>
                Пожалуйста продлите подписку
            </Typography>
            <Typography variant="body1" className={classes.subheading}>
                Чем длиннее период оплаты, тем ниже цена за месяц и выше общая экономия.
            </Typography>
            <Grid container className={classes.root} spacing={4} sx={{ justifyContent: 'center' }}>
                {[...subscribes].sort((a, b) => b.month - a.month).map(v => {
                    const monthlyPrice = getMonthlyPrice(v, activeCurrency);
                    const totalPrice = getTotalPrice(v, activeCurrency);
                    const monthlySavings = getMonthlySavings(v, activeCurrency);
                    const totalSavings = getTotalSavings(v, activeCurrency);
                    const discountPercent = getDiscountPercent(v, activeCurrency);
                    const isFeatured = v.month === 12;
                    const showSavings = totalSavings > 0;

                    return <Grid key={v.monthText + monthlyPrice} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper className={`${classes.paper} ${isFeatured ? classes.paperFeatured : ''}`}>
                        <div className={`${classes.cardHeader} ${isFeatured ? classes.cardHeaderFeatured : ''}`}>
                            <div className={classes.badges}>
                                {v.badge ? <span className={`${classes.badge} ${isFeatured ? classes.badgeAccent : ''}`}>{v.badge}</span> : null}
                                {discountPercent > 0 ? <span className={classes.badge}>Скидка {discountPercent}%</span> : null}
                            </div>
                            <Typography variant="h5" className={classes.planTitle}>
                                {v.monthText}
                            </Typography>
                            <Typography variant="body2" className={classes.planSubtitle}>
                                {v.note || "Гибкое продление без переплаты"}
                            </Typography>
                        </div>
                        <CardContent className={classes.oldPrice}>
                            <Typography variant="body2">
                                {monthlySavings > 0 ? `${formatMoney(getBaseMonthlyPrice(activeCurrency), activeCurrency)} руб. / месяц` : '\u00A0'}
                            </Typography>
                        </CardContent>
                        <CardContent className={classes.cardBody}>
                            <Typography component="h2" variant="h3" color="textPrimary">
                                {formatMoney(monthlyPrice, activeCurrency)}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                &nbsp;{activeCurrencyMeta.perMonthLabel}
                            </Typography>
                        </CardContent>
                        <CardContent className={classes.total}>
                            <Typography variant="body1" color="textSecondary" className={classes.totalText}>
                                {activeCurrencyMeta.totalLabel}: {formatMoney(totalPrice, activeCurrency)} руб.
                            </Typography>
                        </CardContent>
                        <div className={classes.savingsBlock}>
                            <Typography variant="body1" className={classes.savingsText}>
                                {showSavings ? `Экономия ${formatMoney(totalSavings, activeCurrency)} руб.` : 'Базовый тариф без скидки'}
                            </Typography>
                            <Typography className={classes.savingsHint}>
                                {showSavings ? `На ${formatMoney(monthlySavings, activeCurrency)} руб. дешевле каждый месяц` : 'Подходит, если хотите оплачивать помесячно'}
                            </Typography>
                        </div>
                        <div className={classes.featureList}>
                            <div className={classes.featureItem}>
                                <span className={classes.featureDot} />
                                <span>Мгновенное продление доступа</span>
                            </div>
                            <div className={classes.featureItem}>
                                <span className={classes.featureDot} />
                                <span>{showSavings ? 'Фиксируете выгодную цену на весь период' : 'Удобно для короткого периода использования'}</span>
                            </div>
                        </div>
                        <CardActions className={classes.cardActions}>
                            <Button variant={isFeatured ? "contained" : "outlined"}
                                className={`${classes.button} ${isFeatured ? classes.buttonFeatured : ''}`}
                                onClick={() => yandex(organization_id, v.month, activeCurrency)}>
                                Продлить
                            </Button>
                        </CardActions>
                    </Paper>
                </Grid>
                })}

            </Grid>

            <div className={classes.supportWrap}>
                <div className={classes.supportCard}>
                    <Typography variant="h5" className={classes.supportTitle}>
                        Нужна помощь с оплатой?
                    </Typography>
                    <Typography variant="body1" className={classes.supportText}>
                        Если не получается продлить подписку онлайн, напишите нам, и мы быстро поможем подобрать удобный способ оплаты.
                    </Typography>
                    <Link
                        href="https://t.me/samsonin80"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes.supportLink}
                    >
                        Написать в Telegram
                    </Link>
                </div>
            </div>

        </div>
    );
}

export default connect(state => state.auth)(Subscribe)
