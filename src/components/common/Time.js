

export const monthes = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const toStr = i => i > 9 ? i : '0' + i

export const toLocalTimeStr = unix => {

    const time = new Date(isNaN(+unix) ? unix : unix * 1000)

    return time.getDate() + ' ' + monthes[time.getMonth()] + ' ' + time.getFullYear() + 'г. ' +
        toStr(time.getHours()) + ':' + toStr(time.getMinutes()) + ':' + toStr(time.getSeconds())

}

