import React, {useState} from "react";
import {connect} from "react-redux";

import Tree from "./Tree";
import { UiButton, UiModal } from "./common/Ui";


const TreeModal = props => {

    const [currentId, setCurrentId] = useState(() => props.initialCategoryId)

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
            initialId={props.initialCategoryId}
            categories={props.app.categories}
            onSelected={id => setCurrentId(id)}
            finished={id => props.onClose(id)}
        />
    </UiModal>

}

export default connect(state => state)(TreeModal)
