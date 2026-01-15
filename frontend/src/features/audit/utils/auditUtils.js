export const IGNORE_FIELDS = ['__v', 'updatedAt', 'createdAt', '_id'];

export const formatValue = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
};

export const formatDate = (date) =>
    new Date(date).toLocaleString('vi-VN');
