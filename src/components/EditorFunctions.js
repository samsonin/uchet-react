export function inputToA(html, allElements) {

    try {

        let offset = html.indexOf('<input');

        while (offset !== -1) {

            let offset2 = html.indexOf('>', offset);
            let beforeStr = html.slice(0, offset);
            let afterStr = html.slice(offset2 + 1);

            let div = document.createElement('div');
            div.innerHTML = html.slice(offset, offset2 + 1);       //<input type="button" name="date1" value="дата приема">
            let inputs = div.getElementsByTagName('input');

            if (inputs.length === 1) {

                let name = inputs[0].getAttribute("name");
                let value = 'НЕИЗВЕСТНАЯ ПЕРЕМЕННАЯ';
                for (let val in allElements) {
                    allElements[val].map(v => {
                        if (v.name === name) value = v.value;
                    })
                }
                if (value === 'НЕИЗВЕСТНАЯ ПЕРЕМЕННАЯ') console.log(name, value)

                value = value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
                let a = document.createElement('a');
                a.innerHTML = value;
                a.href = value
                inputs[0].replaceWith(a);

            } else {
                console.log(html)
            }
            html = beforeStr + div.innerHTML + afterStr;

            offset = html.indexOf('<input');

        }
    } catch (e) {
    }
    return html;

}
