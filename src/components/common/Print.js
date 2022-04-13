export function Print(doc, alias, aliasFunction) {

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

    const inputs = div.querySelectorAll('input')

    for (let i of inputs) {

        let span = document.createElement('span')

        span.innerHTML = alias[i.name]
            || (typeof (aliasFunction) === "function" && aliasFunction(i.name))
            || ''

        i.parentNode.replaceChild(span, i)

    }

    document.body.append(div)

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