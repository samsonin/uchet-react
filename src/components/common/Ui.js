import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export const UiButton = ({
    children,
    className = "",
    color = "primary",
    block = false,
    size = "",
    type = "button",
    ...props
}) => (
    <button
        type={type}
        className={[
            "ui-button",
            color ? `ui-button-${color}` : "",
            block ? "ui-button-block" : "",
            size ? `ui-button-${size}` : "",
            className,
        ].filter(Boolean).join(" ")}
        {...props}
    >
        {children}
    </button>
);

export const UiModal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    className = "",
}) => {
    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = e => {
            if (e.key === "Escape") onClose();
        };

        document.body.classList.add("modal-open");
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.classList.remove("modal-open");
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="ui-modal-backdrop" onMouseDown={onClose}>
            <div
                className={`ui-modal ${className}`}
                role="dialog"
                aria-modal="true"
                onMouseDown={e => e.stopPropagation()}
            >
                <div className="ui-modal-header">
                    <div className="ui-modal-title">{title}</div>
                    <button
                        type="button"
                        className="ui-modal-close"
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        ×
                    </button>
                </div>
                <div className="ui-modal-body">{children}</div>
                {footer && <div className="ui-modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

export const UiDropdown = ({
    label,
    children,
    align = "left",
    className = "",
    buttonClassName = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onClick = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        const onKeyDown = e => {
            if (e.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", onClick);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onClick);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    return (
        <div className={`ui-dropdown ${className}`} ref={ref}>
            <button
                type="button"
                className={`ui-dropdown-toggle ${buttonClassName}`}
                onClick={() => setIsOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                {label}
                <span className="ui-dropdown-caret" aria-hidden="true" />
            </button>
            {isOpen && (
                <div className={`ui-dropdown-menu ui-dropdown-menu-${align}`} role="menu">
                    {typeof children === "function"
                        ? children(() => setIsOpen(false))
                        : children}
                </div>
            )}
        </div>
    );
};

export const UiDropdownItem = ({
    children,
    onClick,
    to,
    className = "",
    ...props
}) => {
    const itemClassName = `ui-dropdown-item ${className}`;

    if (to) {
        return (
            <Link className={itemClassName} to={to} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={itemClassName} onClick={onClick} {...props}>
            {children}
        </button>
    );
};
