export default function(doc, inputToText) {

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