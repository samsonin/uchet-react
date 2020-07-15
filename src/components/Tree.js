import React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

let tree;
let isNeedClose = false;

export default function ControlledTreeView(props) {

    const [expanded, setExpanded] = React.useState([]);
    const [selected, setSelected] = React.useState([props.id ? props.id.toString() : '0']);

    const handleToggle = (event, nodeIds) => {
        setExpanded(nodeIds);
        isNeedClose = false;
    };

    const handleSelect = (event, nodeId) => {

        setSelected(nodeId);
        if (isNeedClose) props.onSelected(nodeId)
        else isNeedClose = true;

    };

    const renderTree = (nodes) => {
        return (<TreeItem key={'treekey' + nodes.id} nodeId={nodes.id.toString()} label={nodes.name}>
                {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
            </TreeItem>
        )
    };

    function childrenCrate(parentId = 0) {

        let childrens = [];
        props.categories.map(v => {

            if (v.parent_id === parentId) {

                let newChild = {
                    id: v.id,
                    parent_id: v.parent_id,
                    name: v.name,
                };
                let recurceChildren = childrenCrate(newChild.id);
                if (recurceChildren.length > 0) newChild.children = recurceChildren;

                childrens.push(newChild);

            }

        })
        return childrens;

    }

    tree = typeof (tree) === 'object' ?
        tree : childrenCrate()[0];

    return <TreeView
        defaultCollapseIcon={<ExpandMoreIcon/>}
        defaultExpandIcon={<ChevronRightIcon/>}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
    >
        {renderTree(tree)}
    </TreeView>

};