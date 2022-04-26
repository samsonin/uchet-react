export function Print(doc, alias, aliasFunction) {

    const html = doc
        ? doc.text
        : 'Документ не найден'

    const printables = document.getElementsByClassName('printable')

    for (let i = 0; i < printables.length; i++) {
        printables[i].remove()
    }

    const div = document.createElement('div')
    div.className = 'printable'
    div.innerHTML = html

    const inputs = div.querySelectorAll('input')

    for (let i of inputs) {

        const span = document.createElement('span')

        const html = alias[i.name]
            || (typeof (aliasFunction) === "function" && aliasFunction(i.name))
            || ''

        span.innerHTML = html

        if (!html) console.error(i.name)

        i.parentNode.replaceChild(span, i)

    }

    document.body.append(div)

    window.print()

    div.remove()

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