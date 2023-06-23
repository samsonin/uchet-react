export const makeGroup = goods => {

    const group = []

    if (goods.length) {

        let nextGood

        goods.map(g => {

            if (nextGood && nextGood.category_id === g.category_id && nextGood.model === g.model) {

                nextGood.barcodes.push(g.barcode)
                nextGood.count++

            } else {

                if (nextGood) group.push(nextGood)

                nextGood = {
                    barcodes: [g.barcode],
                    category_id: g.category_id,
                    model: g.model,
                    stock_id: g.stock_id,
                    cost: g.cost,
                    remcost: g.remcost,
                    sum: g.sum,
                    ui_wf: g.ui_wf,
                    count: 1
                }

            }

            return g

        })

        group.push(nextGood)

    }

    return group

}
