import React, {useEffect, useState} from "react";

import rest from "../components/Rest";
import GoodActions from "./Good/GoodActions";
import GoodContent from "./Good/GoodContent";

export default function (props) {

    const [good, setGood] = useState()

    useEffect(() => {

        rest('goods/' + props.match.params.barcode)
            .then(res => {
                if (res.status === 200) setGood(res.body)
            })

    }, [])

    return good
        ? <div>
            <GoodActions
                good={good}
            />
            <GoodContent
                good={good}
            />
        </div>
        : <div>
            Good
        </div>

}