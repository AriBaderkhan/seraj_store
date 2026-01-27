export const createItemFormData = (formData, image, isPhone) => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('brand_id', formData.brand_id);
    data.append('category_id', formData.category_id);
    data.append('details', formData.details);
    data.append('is_imei_required', isPhone);
    data.append('serial_no', formData.serial_no || '');
    if (image) data.append('image', image);

    if (isPhone) {
        data.append('color', formData.color);
        data.append('storage', formData.storage);
        data.append('sim_type', formData.sim_type);
        data.append('imei1', formData.imei1);
        data.append('imei2', formData.imei2 || '');
        data.append('purchase_price', formData.purchase_price);
        data.append('selling_price', formData.selling_price);
        data.append('warranty_month', formData.warranty_month || '');
        data.append('status', 'in_stock');
    } else {
        data.append('stock_qty', formData.stock_qty);
        data.append('unit_cost', formData.unit_cost);
        data.append('unit_sell_price', formData.unit_sell_price);
    }

    data.append('purchase_notes', formData.purchase_notes || '');
    return data;
};
