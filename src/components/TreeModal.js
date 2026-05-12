import React, {useState} from "react";
import {connect} from "react-redux";

import Tree from "./Tree";
import { UiButton, UiModal } from "./common/Ui";


const TreeModal = props => {

    const initialCategoryId = props.initialCategoryId || props.initialcategory_id
    const [currentId, setCurrentId] = useState(() => initialCategoryId)

    return <UiModal
        isOpen={props.isOpen}
        onClose={() => props.onClose(0)}
        title="Выбор категории"
        footer={<>
            <UiButton color="secondary" onClick={() => props.onClose(0)}>
                Отмена
            </UiButton>
            <UiButton color="primary" onClick={() => props.onClose(currentId)}>
                Сохранить
            </UiButton>
        </>}
    >
        <Tree
            initialId={initialCategoryId}
            categories={props.app.categories}
            onSelected={id => setCurrentId(id)}
            finished={id => props.onClose(id)}
        />
    </UiModal>

}

export default connect(state => state)(TreeModal)
