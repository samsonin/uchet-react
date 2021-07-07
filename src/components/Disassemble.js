const device = {
    name: 'Samsung',
    cost: 1000
}

class Disassemble extends React.Component {

    state = {
        trs: [
            {id: 0, group: "112116", model: device.name, quantity: 1, cost: device.cost, sum: device.cost * 2}
        ],
        totalCost: device.cost,
        is_submit_enable: true
    };

    createTr(value) {
        return (
            <tr key={"disassembler_tr_index" + value.id} id={"disassembler_tr_index_" + value.id}>
                <td>
                    <select name={"group" + value.id} className="form-control form-control-sm" onChange={this.handleChange} required>
                        <option value="112116">запчасть</option>
                        <option value="103100">товар</option>
                        <option value="115104">техника</option>
                    </select>
                </td>
                <td>
                    <input name={'model' + value.id}
                           value={value.model}
                           onChange={this.handleChange}
                           className="form-control form-control-sm"
                           required/>
                </td>
                <td>
                    <input name={'quantity' + value.id}
                           value={value.quantity}
                           onChange={this.handleChange}
                           className="form-control form-control-sm"
                           type="number"
                           min="0"
                           required/>
                </td>
                <td>
                    <input name={'cost' + value.id}
                           value={value.cost}
                           onChange={this.handleChange}
                           className="form-control form-control-sm"
                           type="number"
                           min="0"
                           required/>
                </td>
                <td>
                    <input name={'sum' + value.id}
                           value={value.sum}
                           onChange={this.handleChange}
                           className="form-control form-control-sm"
                           type="number"
                           min="0"
                           required/>
                </td>
                <td>
                    <button className="btn btn-block btn-outline-danger btn-sm pl-0"
                            onClick={() => this.delTr(value.id)}>
                        <img className="mr-3" src="/src/images/clear.svg" width="16px" alt="delete"/>
                        удалить строчку
                    </button>
                </td>
            </tr>
        )
    }

    handleChange = (e) => {

        let state = this.state;

        let index = $(e.target).closest('tr').attr("id").slice(22);
        let index_leight = index.length;
        let name = e.target.name.slice(0, -index_leight);
        if (name === 'model' || name === 'group') state.trs[index][name] = e.target.value;
        else state.trs[index][name] = +e.target.value;
        this.setState(state);
        this.calculation();

    };

    addTr() {
        let state = this.state;
        state.trs.push({id: state.trs.length, group: "112116", model: device.name, quantity: 1, cost: device.cost, sum: device.cost * 2});
        this.setState(state);
        this.calculation()
    }

    delTr(id) {
        let state = this.state;
        delete state.trs[id];
        this.setState(state);
        this.calculation()
    }

    calculation() {
        let state = this.state;
        let totalCost = 0;
        state.trs.map(tr => {
            totalCost = totalCost + (tr.quantity * tr.cost)
        });
        state.totalCost = totalCost;
        state.is_submit_enable = totalCost >= (device.cost);
        this.setState(state)
    }

    submit = () => {
        let json = this.state;
        json.device = device;
        sendAjax(json, '', 'request', 'disassemble')
            .then(data => {
                try {
                    data = JSON.parse(data);
                    if (typeof (data) !== "object") throw("Error");
                    if (data.result === true) alertNotification("success", "утилизирован");
                    else alertNotification("danger", data.error);
                } catch (e) {
                    alertNotification("danger", e);
                }
            })
    }

    render() {
        return (
            <div>
                <h4>Разбираем на запчасти: {device.name}</h4>
                <table className="table table-bordered table-hover">
                    <thead>
                    <tr>
                        <th scope="col">группа</th>
                        <th scope="col">наименование</th>
                        <th scope="col">количество</th>
                        <th scope="col">себестоимость</th>
                        <th scope="col">цена продажи</th>
                        <th scope="col">
                            <button className="btn btn-sm btn-block btn-outline-success" onClick={() => this.addTr()}>
                                <img className="mr-3" src="/src/images/add.svg" width="20px" alt="plus"/>
                                добавить строчку
                            </button>
                        </th>
                    </tr>
                    </thead>
                    <tbody id="disassembler_tbody">

                    {this.state.trs.map(value => this.createTr(value))}

                    <tr>
                        <td colSpan="3">
                            Суммарная себестоимость должна быть не меньше:
                            <span className="mx-2">
                                {device.cost}
                            </span></td>
                        <td><span id="sum"/>
                        сейчас: {this.state.totalCost}
                        </td>
                        <td colSpan="2">
                            <button
                                onClick={this.submit}
                                className="btn btn-block btn-outline-primary"
                                disabled={!this.state.is_submit_enable}
                            >
                                Разобрать
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }

}