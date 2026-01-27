import brandModel from '../models/brandModel.js'
import appError from '../utils/appError.js';
import categoryBrandsModel from '../models/categoryBrandsModel.js';

async function createBrand({ name, category_ids, description, created_by }) {
    const createdBrand = await brandModel.createBrand({ name, description, created_by });
    if (!createdBrand) throw appError('FAILED_CREATE_BRAND', 'Brand not created', 400);
    const brand_id = createdBrand.id;

    if (Array.isArray(category_ids) && category_ids.length > 0) {
        for (const category_id of category_ids) {
            await categoryBrandsModel.createLinkCB({
                brand_id, category_id
            })
        }
    }

    return createdBrand
}

async function findAllBrands() {
    const brands = await brandModel.findAllBrands();
    return brands
}

async function findBrandById(brand_id) {
    const brand = await brandModel.findBrandById(brand_id);
    if (!brand) throw appError('FAILED_FIND_BRAND', 'Brand not found', 404);
    return brand
}

async function updateBrand(brand_id, { name, category_ids, description, updated_by }) {
    const updatedBrand = await brandModel.updateBrand(brand_id, { name, description, updated_by });
    if (!updatedBrand) throw appError('FAILED_UPDATE_BRAND', 'Brand not updated', 400);

    if (Array.isArray(category_ids)) {
        await categoryBrandsModel.deleteLinksByBrandId(brand_id)

        if (category_ids.length > 0) {
            for (const category_id of category_ids) {
                await categoryBrandsModel.createLinkCB({ brand_id, category_id })
            }
        }
    }
    return updatedBrand
}

async function deleteBrandById(brand_id) {
    const deletedBrand = await brandModel.deleteBrandById(brand_id);
    if (!deletedBrand) throw appError('FAILED_DELETE_BRAND', 'Brand not deleted', 400);
    return deletedBrand
}

async function findBrandsByCategoryId(category_id) {
    const brands = await brandModel.findBrandsByCategoryId(category_id);
    return brands;
}

export default { createBrand, findAllBrands, findBrandById, updateBrand, deleteBrandById, findBrandsByCategoryId }