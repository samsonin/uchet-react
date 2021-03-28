import React from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
    closeSnackbar,
    enqueueSnackbar,
    upd_app,
} from "../../actions/actionCreator";
import {
    Card,
    CardHeader,
    CardContent,
    Collapse,
    CardActions,
    TextField,
    FormControl,
    InputAdornment,
    Typography,
    FormControlLabel,
    Checkbox,
    Grid,
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles({
    card: {
        marginBottom: "10px",
    },
    cardHeader: {
        backgroundColor: "#F7F7F7",
        width: "100%",
        borderBottom: "1px solid #e9ecef",
    },

    adornment: {
        backgroundColor: "#E9ECEF",
        color: "black",
        height: "100%",
        width: "50px",
        textAlign: "center",
        padding: 10,
    },
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            enqueueSnackbar,
            closeSnackbar,
            upd_app,
        },
        dispatch
    );

const SimpleCard = ({title, children}) => {
    const [expanded, setExpanded] = React.useState(true);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <CardActions
                onClick={handleExpandClick}
                aria-expanded={expanded}
                style={{padding: 0}}
            >
                <CardHeader
                    title={title}
                    className={classes.cardHeader}
                    titleTypographyProps={{variant: "subtitle1"}}
                />
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Grid container spacing={1}>
                        {children}
                    </Grid>
                </CardContent>
            </Collapse>
        </Card>
    );
};
const CustomInputWithLabel = ({title, defVal, end, fullWidth, width}) => {
    const classes = useStyles();

    return (
        <FormControl margin="normal">
            <Typography variant="subtitle1" gutterBottom>
                {title}
            </Typography>
            <TextField
                defaultValue={defVal}
                type="number"
                InputProps={{
                    endAdornment: (
                        <InputAdornment
                            position="end"
                            variant="filled"
                            className={classes.adornment}
                        >
                            {end}
                        </InputAdornment>
                    ),
                    style: {
                        height: "30px",
                        color: "gray",
                        paddingRight: 0,
                        marginRight: 40,
                        minWidth: width ? "0" : "400px",
                        width: width,
                    },
                }}
                variant="outlined"
                size="small"
                fullWidth={fullWidth}
            />
        </FormControl>
    );
};

const Config = ({app}) => {
    const requestSettings = () => {
        //ф-я отсуствовала я добавил заглушку чтобы приложение не крашилось
    }
    const [state, setState] = React.useState({
        checkedA: false,
        checkedB: false,
        checkedF: false,
        checkedG: false,
    });
    const handleChange = (event) => {
        setState({...state, [event.target.name]: event.target.checked});
    };
    return (
        <>
            <form id="form_app_settings">
                <SimpleCard title="Ремонт">
                    <Grid item md xs={4} sm={3}>
                        <CustomInputWithLabel
                            title="Стоимость ремонта по умолчанию"
                            defVal={800}
                            end="RUR"
                        />
                        <CustomInputWithLabel
                            title="Оценочная стоимость оборудования"
                            defVal={100}
                            end="RUR"
                        />
                        <CustomInputWithLabel
                            title="Срок гарантии"
                            defVal={30}
                            end="дней"
                        />
                        <CustomInputWithLabel
                            title="Срок бесплатного хранения после ремонта"
                            defVal={60}
                            end="дней"
                        />
                        <CustomInputWithLabel title="Предоплата" defVal={0} end="RUR"/>
                        <CustomInputWithLabel title="Срок ремонта" defVal={60} end="дней"/>
                    </Grid>
                </SimpleCard>
                <SimpleCard title="Залог">
                    <Grid item md xs={4} sm={3}>
                        <CustomInputWithLabel
                            title="Минимальная переплата за залог"
                            defVal={500}
                            end="RUR"
                        />
                        <CustomInputWithLabel
                            title="Ежедневный процент за залог"
                            defVal={5}
                            end="5"
                        />
                    </Grid>
                </SimpleCard>
                <SimpleCard title="Зарплата">
                    <Grid item>
                        <Typography variant="h6">За заказы</Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.checkedA}
                                    onChange={handleChange}
                                    name="checkedA"
                                    color="primary"
                                />
                            }
                            label="Включить зарплату за приемку в себестоимость заказа и считать непосредственно тому кто принял"
                        />
                        <CustomInputWithLabel
                            title="Минимальная сумма с которой считать что заказ выгодный и с него платить за приемку"
                            defVal={800}
                            end="RUR"
                            fullWidth={true}
                        />
                        <br/>
                        <CustomInputWithLabel
                            title="   Cумма за прием заказа (по точкам)"
                            defVal={0}
                            end="RUR"
                        />

                        <CustomInputWithLabel
                            title="Сумма за внесение запчастей"
                            defVal={150}
                            end="%"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.checkedB}
                                    onChange={handleChange}
                                    name="checkedB"
                                    color="primary"
                                />
                            }
                            label="Включить зарплату за закрытие в себестоимость заказа и начислить тому кто непосредственно закрыл"
                        />
                        <br/>
                        <CustomInputWithLabel
                            title="Процент за закрытие заказа"
                            defVal={2}
                            end="%"
                        />
                        <CustomInputWithLabel
                            title="Процент мастеру за выполнение заказа"
                            defVal={35}
                            end="%"
                        />
                        <CustomInputWithLabel
                            title="Уменьшение процента мастеру за выполнение заказа при повторном обращении по гарантии"
                            defVal={2}
                            end="%"
                            fullWidth={true}
                        />

                        <Typography variant="h6">За товары</Typography>

                        <CustomInputWithLabel
                            width={220}
                            title="За покупку техники"
                            defVal={50}
                            end="RUR"
                        />
                        <CustomInputWithLabel
                            width={220}
                            title="За залог"
                            defVal={75}
                            end="RUR"
                        />

                        <CustomInputWithLabel
                            width={220}
                            title="За продажу техники"
                            defVal={25}
                            end="%"
                        />

                        <CustomInputWithLabel
                            width={220}
                            title="За продажу аксессуаров"
                            defVal={25}
                            end="%"
                        />
                        <Typography variant="h6">За выход</Typography>
                        <CustomInputWithLabel
                            title="Минимальная зарпалата продавца-приемщика в день"
                            defVal={200}
                            end="RUR"
                        />
                    </Grid>
                </SimpleCard>

                <SimpleCard title="Локация">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={state.checkedC}
                                onChange={handleChange}
                                name="checkedC"
                                color="primary"
                            />
                        }
                        label="Привязать сотрудника к точке"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={state.checkedD}
                                onChange={handleChange}
                                name="checkedD"
                                color="primary"
                            />
                        }
                        label="Проверять локацию при авторизации на точке"
                    />
                </SimpleCard>

                <SimpleCard title="Гарантийные обязательства">
                    <CustomInputWithLabel
                        title="Гарантийный срок при продаже техники"
                        defVal={14}
                        end="дней"
                    />
                    <CustomInputWithLabel
                        title="Гарантийный срок при продаже остальных товаров"
                        defVal={14}
                        end="дней"
                    />
                </SimpleCard>
            </form>
        </>
    );
};

export default connect((state) => state, mapDispatchToProps)(Config);
