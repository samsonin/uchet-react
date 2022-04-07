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

    const date = created
        ? new Date(created)
        : new Date()

    const month = monthes[date.getMonth()]

    return month
        ? date.getDate() + ' ' + monthes[date.getMonth()].toLowerCase() + ' ' + date.getFullYear() + 'г.'
        : ''
}