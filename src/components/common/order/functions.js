export const totalSum = order => {

    let payments = 0

    if (order.json && order.json.payments.length) order.json.payments.map(p => payments += +p.sum)

    return payments
}
