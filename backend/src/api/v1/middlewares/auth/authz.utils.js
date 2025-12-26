function canAny(userPerms = [], required = []) {
    if (!required || required.length === 0) return true;
    const set = new Set(userPerms);
    return required.some((p) => set.has(p));
}

function canAll(userPerms = [], required = []) {
    if (!required || required.length === 0) return true;
    const set = new Set(userPerms);
    return required.every((p) => set.has(p));
}

module.exports = { canAny, canAll };
