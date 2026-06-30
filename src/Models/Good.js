const normalizeGroupText = value => String(value || '')
    .replace(/[\s\p{C}]+/gu, '')
    .toLowerCase()

export const makeGroup = goods => {

    const group = []
    const groupsByKey = new Map()

    if (goods.length) {

        goods.map(g => {

            const groupModelKey = normalizeGroupText(g.model)
            const groupKey = [
                g.category_id || '',
                groupModelKey,
                g.stock_id || '',
            ].join('|')
            const nextGood = groupsByKey.get(groupKey)

            if (nextGood) {

                nextGood.barcodes.push(g.barcode)
                nextGood.count++

                if (g.sum < nextGood.sum) nextGood.minSum = g.sum
                if (g.sum > nextGood.sum) nextGood.maxSum = g.sum
                nextGood.costTotal += +(g.remcost || g.cost || 0)
                nextGood.avgCost = Math.round(nextGood.costTotal / nextGood.count)

            } else {

                const costValue = +(g.remcost || g.cost || 0)

                const newGroup = {
                    barcodes: [g.barcode],
                    category_id: g.category_id,
                    model: g.model,
                    modelKey: groupModelKey,
                    stock_id: g.stock_id,
                    cost: g.cost,
                    remcost: g.remcost,
                    costTotal: costValue,
                    avgCost: Math.round(costValue),
                    sum: g.sum,
                    minSum: g.sum,
                    maxSum: g.sum,
                    ui_wf: g.ui_wf,
                    count: 1
                }

                groupsByKey.set(groupKey, newGroup)
                group.push(newGroup)

            }

            return g

        })

    }

    return group

}
