import React from "react";
import { Link } from 'react-router-dom';

import { siteMap } from "./SiteMap";
import { connect } from "react-redux";

// выделяем цветом популярные кнопки
const primaryIds = [1, 10, 31];

// расстановка кнопок на главной странице

const Main = ({ admin }) => {

    return <div className="main-button-board">
        {[
            [1, 2, 3],
            [10, 11, 14, 15, 16, 17, 19],
            [31, 32, 33, 35],
            [21, 22, 24],
            [40, 41, 42, 43, 45, 46, 47, 48],
            [51, 52, 53],
        ].map(arr => <div
            className="main-button-row"
            key={arr.toString()}
        >
            {arr.map(id => {

                const smItem = siteMap(admin)
                    .find(sm => sm.id === id)

                return smItem
                    ? <Link
                        key={"main-button-key" + smItem.id}
                        to={"/" + smItem.path}
                        className={`main-button ${primaryIds.includes(id) ? 'main-button-primary' : ''}`}
                        role="button"
                    >
                        {smItem.text}
                    </Link>
                    : null
            })}
        </div>)}
    </div>
}

export default connect(state => state.auth)(Main)
