import React from "react";

export default function(first, second) {

    const replaceUndefined = v => v === undefined ? null : v

    return <>
            <span style={{
                fontWeight: 'bold'
            }}>
                {replaceUndefined(first)}
            </span>
        <br/>
        {replaceUndefined(second)}
    </>

}