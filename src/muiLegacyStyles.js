import React from "react";
import { css } from "@emotion/css";
import { createTheme } from "@mui/material/styles";

const theme = createTheme();

export const makeStyles = stylesOrCreator => () => {
    const styles = typeof stylesOrCreator === "function"
        ? stylesOrCreator(theme)
        : stylesOrCreator;

    return Object.entries(styles).reduce((acc, [key, value]) => {
        acc[key] = css(value);
        return acc;
    }, {});
};

export const styled = BaseComponent => stylesOrCreator => React.forwardRef((props, ref) => {
    const styles = typeof stylesOrCreator === "function"
        ? stylesOrCreator({ theme, ...props })
        : stylesOrCreator;

    const generatedClassName = css(styles);
    const className = [generatedClassName, props.className].filter(Boolean).join(" ");

    return <BaseComponent {...props} ref={ref} className={className} />;
});

export default makeStyles;
