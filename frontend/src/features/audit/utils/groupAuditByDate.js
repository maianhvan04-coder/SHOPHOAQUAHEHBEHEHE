export const formatDateGroup = (date, now = Date.now()) => {
    const d = new Date(date);
    const today = new Date(now);
    const yesterday = new Date(now);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a, b) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    if (isSameDay(d, today)) return "Hôm nay";
    if (isSameDay(d, yesterday)) return "Hôm qua";

    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const groupAuditByDate = (items) => {
    const map = {};

    items.forEach((item) => {
        const key = formatDateGroup(item.createdAt);
        if (!map[key]) map[key] = [];
        map[key].push(item);
    });

    return Object.entries(map).map(([date, logs]) => ({
        date,
        logs,
    }));
};
