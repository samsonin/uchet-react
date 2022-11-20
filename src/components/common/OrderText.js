export const OrderText = (order, app) => {

    const i = order.order_id || order.id

    const stock = app.stocks.find(s => s.id === order.stock_id)

    return app.current_stock_id === order.stock_id
        ? i
        : stock
            ? stock.name + ', ' + i
            : 'точка не определена, ' + i
}