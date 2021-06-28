import React, {useEffect, useRef, useState} from 'react';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

export default function ControlledTreeView({categories, initialId, onSelected, finished}) {

    const expandedInitial = useRef([])

    const [expanded, setExpanded] = useState(getExpanded(initialId || 0))
    const [selected, setSelected] = useState(initialId ? initialId.toString() : '0')
    const [tree] = useState(() => makeTree(0))

    const isNeedClose = useRef(false)

    useEffect(() => {

        onSelected(expandedInitial.current[0])

        // eslint-disable-next-line
    }, [])

    // вызывается при клике на TreeItem
    const handleToggle = (_, nodeIds) => {

        setExpanded(nodeIds);
        isNeedClose.current = false;

    }

    // вызывается после handleToggle
    const handleSelect = (_, nodeId) => {

        if (isNeedClose.current) return finished(nodeId)

        setSelected(nodeId)
        onSelected(nodeId)

        isNeedClose.current = true;

    }

    function getExpanded(id) {

        if (id > 0) {

            expandedInitial.current.push(id.toString())

            getExpanded(categories.find(cat => cat.id === id).parent_id)

        }

        return expandedInitial.current
    }

    // TODO сделать чтобы запускалась только при изменении categories
    function makeTree(parentId) {

        return categories
            .filter(cat => cat.parent_id === parentId)
            .map(cat => {

                let childs = makeTree(cat.id)

                return <TreeItem key={'treekeychild' + cat.id}
                                 nodeId={cat.id.toString()}
                                 label={cat.name}
                >
                    {childs.length > 0
                        ? childs
                        : ''}
                </TreeItem>

            })

    }

    return <TreeView
        defaultCollapseIcon={<ExpandMoreIcon/>}
        defaultExpandIcon={<ChevronRightIcon/>}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
    >
        {tree}
    </TreeView>

}
