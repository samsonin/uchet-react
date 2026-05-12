import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { siteMap } from "./SiteMap";

const SIDEBAR_SECTIONS = [
    { name: "\u0423\u0441\u043b\u0443\u0433\u0438", arr: [1, 2, 3] },
    { name: "\u0422\u041c\u0426", arr: [10, 11, 14, 15, 16, 17, 19] },
    { name: "\u041a\u043e\u043d\u0442\u0440\u0430\u0433\u0435\u043d\u0442\u044b", arr: [21, 22, 24] },
    { name: "\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430", arr: [31, 32, 33, 35] },
    { name: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438", arr: [40, 44, 41, 42, 43, 45, 46, 47, 48, 49, 50] },
    { name: "\u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438", arr: [51, 52, 53] },
];

const Sidebar = props => {
    const map = siteMap(props.admin);

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
            {SIDEBAR_SECTIONS.map(section => {
                const items = section.arr
                    .map(id => map.find(v => v.id === id))
                    .filter(Boolean);

                if (!items.length) return "";

                if (items.length === 1) {
                    const item = items[0];
                    return <Link
                        key={"sidebar-direct-link-" + item.id}
                        to={"/" + item.path}
                        className="sidebar-section-button sidebar-section-link"
                    >
                        {item.text}
                    </Link>;
                }

                return <div key={"sidebar-section-" + section.name}>
                    <button
                        type="button"
                        className="sidebar-section-button"
                        onClick={e => nextDivToggle(e.currentTarget.nextSibling)}
                    >
                        {section.name}
                    </button>
                    <div className="List-item hideBlock">
                        {items.map(item => <div className="link_items" key={"sidebar-link-" + item.id}>
                            <Link to={"/" + item.path}>
                                {item.text}
                            </Link>
                        </div>)}
                    </div>
                </div>;
            })}
        </div>
    </div>;
};

export default connect(state => state.auth)(Sidebar);
