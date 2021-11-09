import React from "react";

export default function(first, second) {
    return first || second
        ? <>
            <span style={{
                fontWeight: 'bold'
            }}>
                {first}
            </span>
            <br/>
            {second}
        </>
        : 'не определен'
}