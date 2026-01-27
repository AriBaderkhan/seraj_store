import asyncWrap from '../utils/asyncWrap.js';
import brandService from '../services/brandService.js';

const createBrand = asyncWrap(async (req, res) => {
    const { name, category_ids, description } = req.body;
    const created_by = req.user.id
    const brand = await brandService.createBrand({ name, category_ids, description, created_by });
    res.status(201).json({ message: "Brand created successfully", data: brand });
});

const findAllBrands = asyncWrap(async (req, res) => {
    const brands = await brandService.findAllBrands();
    res.status(200).json({ message: "Brands fetched successfully", data: brands });
});

const findBrandById = asyncWrap(async (req, res) => {
    const brand_id = Number(req.params.brandId)
    const brand = await brandService.findBrandById(brand_id);
    res.status(200).json({ message: "Brand fetched successfully", data: brand });
});

const updateBrand = asyncWrap(async (req, res) => {
    const brand_id = Number(req.params.brandId)
    const { name, category_ids, description } = req.body;
    const updated_by = req.user.id
    const brand = await brandService.updateBrand(brand_id, { name, category_ids, description, updated_by });
    res.status(200).json({ message: "Brand updated successfully", data: brand });
});

const deleteBrandById = asyncWrap(async (req, res) => {
    const brand_id = Number(req.params.brandId)
    const brand = await brandService.deleteBrandById(brand_id);
    res.status(200).json({ message: "Brand deleted successfully", data: brand });
});


const findBrandsByCategoryId = asyncWrap(async (req, res) => {
    const category_id = Number(req.params.categoryId);
    console.log(`Fetching brands for category ID: ${category_id}`);
    const brands = await brandService.findBrandsByCategoryId(category_id);
    console.log(`Found brands:`, brands);
    res.status(200).json({ message: "Brands fetched successfully", data: brands });
});

export default { createBrand, findAllBrands, findBrandById, updateBrand, deleteBrandById, findBrandsByCategoryId };