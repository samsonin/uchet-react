import React, { useState } from "react";
import { connect } from "react-redux";
import { Button } from "@mui/material";

import Tree from "../Tree";
import { intInputHandler } from "./InputHandlers";

const CategoryHandler = props => {

    const categories = props.app.categories || []
    const [treeOpen, setTreeOpen] = useState(false)
    const category = categories.find(c => c.id === props.id)

    const handleTree = id => {
        intInputHandler(id, props.setId)
        setTreeOpen(false)
    }

    if (treeOpen) {
        return <div className="category-handler category-handler-tree">
            <div className="category-handler-tree-content">
                <Tree
                    initialId={props.id}
                    categories={categories}
                    onSelected={id => intInputHandler(id, props.setId)}
                    finished={id => handleTree(id)}
                />
            </div>
            <div className="category-handler-tree-actions">
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setTreeOpen(false)}
                >
                    Ок
                </Button>
            </div>
        </div>
    }

    return <div className="category-handler">
        <div className="category-handler-label">Категория:</div>
        <div className="category-handler-control">
            <Button
                size="small"
                className="w-100 category-handler-button"
                onClick={() => setTreeOpen(true)}
            >
                {category ? category.name : "Выбрать..."}
            </Button>
        </div>
    </div>
}

export default connect(state => state)(CategoryHandler)
