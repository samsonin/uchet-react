import React, { useEffect, useMemo, useRef, useState } from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

export default function ControlledTreeView({ categories, initialId, onSelected }) {
    const expandedInitial = useRef([]);

    const normalizedCategories = useMemo(() => (categories || []).map(cat => ({
        ...cat,
        id: Number(cat.id),
        parent_id: cat.parent_id == null || cat.parent_id === "" ? 0 : Number(cat.parent_id),
    })), [categories]);

    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState(initialId ? initialId.toString() : null);

    useEffect(() => {
        expandedInitial.current = [];

        const nextExpanded = getExpanded(initialId || 0);
        setExpanded(nextExpanded);
        setSelected(initialId ? initialId.toString() : null);

        if (initialId) {
            onSelected(initialId.toString());
        }
        // eslint-disable-next-line
    }, [initialId, normalizedCategories]);

    const handleToggle = (_, nodeIds) => {
        setExpanded(nodeIds);
    };

    const handleSelect = (_, nodeId) => {
        setSelected(nodeId);
        onSelected(nodeId);
    };

    function getExpanded(id) {
        if (id > 0) {
            expandedInitial.current.push(id.toString());

            const category = normalizedCategories.find(cat => cat.id === Number(id));
            if (category && category.parent_id > 0) {
                getExpanded(category.parent_id);
            }
        }

        return expandedInitial.current;
    }

    function makeTree(parentId) {
        return normalizedCategories
            .filter(cat => cat.parent_id === Number(parentId))
            .map(cat => {
                const children = makeTree(cat.id);

                return <TreeItem
                    key={"treekeychild" + cat.id}
                    itemId={cat.id.toString()}
                    label={cat.name}
                >
                    {children.length ? children : null}
                </TreeItem>;
            });
    }

    return <SimpleTreeView
        slots={{
            collapseIcon: ExpandMoreIcon,
            expandIcon: ChevronRightIcon,
        }}
        expandedItems={expanded}
        selectedItems={selected}
        onExpandedItemsChange={handleToggle}
        onSelectedItemsChange={handleSelect}
    >
        {makeTree(0)}
    </SimpleTreeView>;
}
