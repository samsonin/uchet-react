export function Print(doc, inputToText) {

    const html = doc
        ? doc.text
        : 'Документ не найден'

    const printables = document.getElementsByClassName('printable')

    for (let i = 0; i < printables.length; i++) {
        printables[i].remove()
    }

    let div = document.createElement('div')
    div.className = 'printable'
    div.innerHTML = html

    document.body.append(inputToText(div))

    window.print()

}

const monthes = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

export const createDate = created => {

    if (created) {
        return created.substr(8, 2) + ' ' + monthes[+created.substr(5, 2) - 1].toLowerCase() + ' ' + created.substr(0, 4) + 'г.'
    } else {
        const date = new Date();
        return date.getDate() + ' ' + monthes[date.getMonth()].toLowerCase() + ' ' + date.getFullYear() + 'г.'
    }

}