export const canReturnGoodToProvider = good => {
    const wo = good?.wo || "";
    return wo === "" || wo === "reject";
};
