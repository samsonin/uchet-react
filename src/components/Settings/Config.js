import React from "react";


// TODO переделать компонент на функциональный,
// избавиться от classname и переписать используя @material-ui
// сократить и оптимизировать код
// пожалуйста, работайте в отдельной ветке гита

export const Config = () => {

    return '';

    return <form id="form_app_settings">

        <div className="card border-light mb-3">

            <div className="card-header" onClick={(e) => {
                const nextDiv = e.currentTarget.nextSibling
                nextDiv.classList.contains('hideBlock')
                    ?  nextDiv.classList.remove('hideBlock')
                    :  nextDiv.classList.add('hideBlock')
            }}>
                Ремонт
            </div>

            <div className="card-body">

                <div className="form-row">
                    <div className="form-group col">
                        <label htmlFor="rem_sum">Стоимость ремонта по умолчанию</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.rem_sum}
                                   onChange={e => this.requestSettings('changeConfig', '', 'rem_sum', e.target.value)}
                            />
                            <div className="input-group-append">
                                <span className="input-group-text">RUR</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col">
                        <label htmlFor="rem_assessed_value">Оценочная стоимость оборудования</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.rem_assessed_value}
                                   onChange={e => this.requestSettings('changeConfig', '', 'rem_assessed_value', e.target.value)}
                            />
                            <div className="input-group-append">
                                <span className="input-group-text">RUR</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col">
                        <label htmlFor="remont_warranty">Срок гарантии</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.remont_warranty}
                                   onChange={e => this.requestSettings('changeConfig', '', 'remont_warranty', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">дней</span>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col">
                        <label htmlFor="free_save">Срок бесплатного хранения после ремонта</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.free_save}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'free_save', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">дней</span>
                            </div>

                        </div>
                    </div>
                    <div className="form-group col">
                        <label htmlFor="prepayment">Предоплата</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.prepayment}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'prepayment', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">RUR</span></div>

                        </div>
                    </div>
                    <div className="form-group col">
                        <label htmlFor="time_remont">Срок ремонта</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.time_remont}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'time_remont', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">дней</span>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </div>

        <div className="card border-light mb-3">

            <div className="card-header" onClick={(e) => {
                const nextDiv = e.currentTarget.nextSibling
                nextDiv.classList.contains('hideBlock')
                    ?  nextDiv.classList.remove('hideBlock')
                    :  nextDiv.classList.add('hideBlock')
            }}>
                Залог
            </div>

            <div className="card-body">
                <div className="form-row">
                    <div className="form-group col">
                        <label htmlFor="zalog_min_sum">Минимальная переплата за залог</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zalog_min_sum}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zalog_min_sum', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">RUR</span></div>

                        </div>
                    </div>

                    <div className="form-group col">
                        <label htmlFor="zalog_day_percent">Ежедневный процент за залог</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zalog_day_percent}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zalog_day_percent', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div className="card border-light mb-3">
            <div className="card-header" onClick={(e) => {
                const nextDiv = e.currentTarget.nextSibling
                nextDiv.classList.contains('hideBlock')
                    ?  nextDiv.classList.remove('hideBlock')
                    :  nextDiv.classList.add('hideBlock')
            }}>
                Зарплата
            </div>
            <div className="card-body">

                <h5 className="card-title roll">За заказы</h5>
                <div className="form-row">

                    <div className="form-group col-12">
                        <div className="form-group form-check">
                            <input type="checkbox" className="form-check-input"
                                   defaultValue={this.props.app.config.zp_for_take}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_for_take', e.target.checked)}
                            />
                            <label htmlFor="zp_for_take">
                                Включить зарплату за приемку в себестоимость заказа и считать непосредственно тому
                                кто принял
                            </label>
                        </div>
                    </div>

                    <div className="form-group col-12">
                        <label htmlFor="zp_take_min_sum">
                            Минимальная сумма с которой считать что заказ выгодный и с него платить за приемку
                        </label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_take_min_sum}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_take_min_sum', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">RUR</span></div>

                        </div>
                    </div>

                    <div className="col-12">Cумма за прием заказа (по точкам)</div>

                    <div className="form-group col-12">
                        <label htmlFor="zp_add_part">Сумма за внесение запчастей</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_add_part}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_add_part', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">RUR</span></div>
                        </div>
                    </div>

                    <div className="form-group col-6">
                        <div className="form-group form-check">
                            <input type="checkbox" className="form-check-input"
                                   defaultValue={this.props.app.config.zp_for_checkout}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_for_checkout', e.target.checked)}
                            />
                            <label htmlFor="zp_for_checkout">
                                Включить зарплату за закрытие в себестоимость заказа и начислить тому кто
                                непосредственно закрыл
                            </label>
                        </div>
                    </div>

                    <div className="form-group col-6">
                        <label htmlFor="zp_saler_per">
                            Процент за закрытие заказа
                        </label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_saler_per}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_saler_per', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-12">
                        <label htmlFor="zp_master_per">
                            Процент мастеру за выполнение заказа
                        </label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_master_per}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_master_per', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-12">
                        <label htmlFor="zp_repeat_per">
                            Уменьшение процента мастеру за выполнение заказа при повторном обращении по гарантии
                        </label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_repeat_per}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_repeat_per', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>

                </div>

                <h5 className="card-title roll">За товары</h5>
                <div className="form-row">
                    <div className="form-group col-auto">
                        <label htmlFor="zp_salary_buy">
                            За покупку техники
                        </label>
                        <div className="input-group input-group-sm">
                            <input type="text" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_salary_buy}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_salary_buy', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">RUR</span></div>
                        </div>
                    </div>

                    <div className="form-group col-auto">
                        <label htmlFor="zp_salary_zalog">
                            За залог
                        </label>
                        <div className="input-group input-group-sm">
                            <input type="text" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_salary_zalog}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_salary_zalog', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">RUR</span></div>

                        </div>
                    </div>

                    <div className="form-group col-auto">
                        <label htmlFor="zp_salary_sell">За продажу техники</label>
                        <div className="input-group input-group-sm">
                            <input type="text" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_salary_sell}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_salary_sell', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">%</span></div>

                        </div>
                    </div>

                    <div className="form-group col-auto">
                        <label htmlFor="zp_salary_goods">За продажу аксессуаров</label>
                        <div className="input-group input-group-sm">
                            <input type="text" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_salary_goods}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_salary_goods', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">%</span></div>

                        </div>
                    </div>
                </div>

                <h5 className="card-title roll">За выход</h5>
                <div className="form-row">
                    <div className="form-group col-12">
                        <label htmlFor="zp_daily_min">Минимальная зарплата продавца-приемщика в день</label>
                        <div className="input-group input-group-sm">
                            <input type="text" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.zp_daily_min}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'zp_daily_min', e.target.value)}
                            />
                            <div className="input-group-append"><span
                                className="input-group-text">RUR</span></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div className="card border-light mb-3">
            <div className="card-header" onClick={(e) => {
                const nextDiv = e.currentTarget.nextSibling
                nextDiv.classList.contains('hideBlock')
                    ?  nextDiv.classList.remove('hideBlock')
                    :  nextDiv.classList.add('hideBlock')
            }}>
                Локация
            </div>
            <div className="card-body">
                <div className="form-row">
                    <div className="form-group col-12">
                        <div className="form-group form-check">
                            <input type="checkbox" className="form-check-input"
                                   defaultValue={this.props.app.config.one_point}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'one_point', e.target.checked)}
                            />
                            <label htmlFor="one_point">Привязать сотрудника к точке</label>
                        </div>
                    </div>
                    <div className="form-group col-12">
                        <div className="form-group form-check">
                            <input type="checkbox" className="form-check-input"
                                   defaultValue={this.props.app.config.location_check}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'location_check', e.target.checked)}
                            />
                            <label htmlFor="location_check">Проверять локацию при авторизации на точке</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="card border-light mb-3">
            <div className="card-header" onClick={(e) => {
                const nextDiv = e.currentTarget.nextSibling
                nextDiv.classList.contains('hideBlock')
                    ?  nextDiv.classList.remove('hideBlock')
                    :  nextDiv.classList.add('hideBlock')
            }}>
                Гарантийные обязательства
            </div>
            <div className="card-body">
                <div className="form-row">
                    <div className="form-group col-auto">
                        <label htmlFor="goods_phones_warranty">Гарантийный срок при продаже техники</label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.goods_phones_warranty}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'goods_phones_warranty', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">дней</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-auto">
                        <label htmlFor="goods_accessories_warranty">
                            Гарантийный срок при продаже остальных товаров
                        </label>
                        <div className="input-group input-group-sm">
                            <input type="number" className="form-control form-control-sm"
                                   defaultValue={this.props.app.config.goods_accessories_warranty}
                                   onChange={(e) => this.requestSettings('changeConfig', '', 'goods_accessories_warranty', e.target.value)}
                            />
                            <div className="input-group-append"><span className="input-group-text">дней</span>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>

    </form>

}
