import { formatDateGroup } from './groupAuditByDate';

export const groupAuditByProductAndDate = (
    items = [],
    now = Date.now()
) => {
    const productMap = {};

    items.forEach((item) => {
        const productId = item.resourceId;
        const productName =
            item.changes?.after?.name ||
            item.changes?.before?.name ||
            'Không rõ';

        if (!productMap[productId]) {
            productMap[productId] = {
                productId,
                productName,
                dateMap: {},
            };
        }

        const dateKey = formatDateGroup(item.createdAt, now);

        if (!productMap[productId].dateMap[dateKey]) {
            productMap[productId].dateMap[dateKey] = [];
        }

        productMap[productId].dateMap[dateKey].push(item);
    });

    // convert map → array
    return Object.values(productMap).map((product) => ({
        productId: product.productId,
        productName: product.productName,
        dates: Object.entries(product.dateMap).map(
            ([date, logs]) => ({
                date,
                logs,
            })
        ),
    }));
};
