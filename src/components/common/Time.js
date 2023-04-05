import React from "react";


export const monthes = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const toStr = i => i > 9 ? i : '0' + i

export const toLocalTimeStr = (unix, needTwoLine = false) => {

    const time = new Date(isNaN(+unix) ? unix : unix * 1000)

    const firstLine = time.getDate() + ' ' + monthes[time.getMonth()] + ' ' + time.getFullYear() + 'г. '
    const secondLine = toStr(time.getHours()) + ':' + toStr(time.getMinutes()) + ':' + toStr(time.getSeconds())

    return needTwoLine
        ? <>
            <span style={{
                fontWeight: 'bold'
            }}>
                {firstLine}
            </span>
            <br/>
            {secondLine}
        </>
        : firstLine + secondLine

}

export const minDate = '2015-07-28'

const full = i => i > 9 ? i : '0' + i
export const today = (new Date()).getFullYear() + '-' + full(1 + (new Date()).getMonth()) + '-' + full((new Date()).getDate())

export const setInRange = date => date > today ? today : date < minDate ? minDate : date

