import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { siteMap } from "./SiteMap";

const Sidebar = props => {

    const nextDivToggle = nextDiv => {
        if (nextDiv) {
            if (nextDiv.classList.contains("hideBlock")) {
                document.querySelectorAll(".List-item")
                    .forEach(item => item.classList.add("hideBlock"));
                nextDiv.classList.remove("hideBlock");
            } else {
                nextDiv.classList.add("hideBlock");
            }
        }
    };

    return <div id="sidebar-wrapper" className="bg-light border-right">
        <div className="sidebar-list">
            {[
                { name: "Услуги", arr: [1, 2, 3] },
                { name: "ТМЦ", arr: [10, 11, 14, 15, 16, 17, 19] },
                { name: "Контрагенты", arr: [21, 22, 24] },
                { name: "Аналитика", arr: [31, 32, 33, 35] },
                { name: "Настройки", arr: [40, 41, 42, 43, 45, 46, 47, 48] },
                { name: "Интеграции", arr: [51, 52, 53] },
            ].map(section => siteMap(props.admin).find(sm => section.arr.includes(sm.id))
                ? <div key={"sidebar-section-" + section.name}>
                    <button
                        type="button"
                        className="sidebar-section-button"
                        onClick={e => nextDivToggle(e.currentTarget.nextSibling)}
                    >
                        {section.name}
                    </button>
                    <div className="List-item hideBlock">
                        {section.arr.map(id => {
                            const item = siteMap(props.admin).find(v => v.id === id);
                            return item
                                ? <div className="link_items" key={"sidebar-link-" + id}>
                                    <Link to={"/" + item.path}>
                                        {item.text}
                                    </Link>
                                </div>
                                : null;
                        })}
                    </div>
                </div>
                : ""
            )}
        </div>
    </div>;
};

export default connect(state => state.auth)(Sidebar);
