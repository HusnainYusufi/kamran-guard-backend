const Category = require('../models/Category.model');
const logger = require('../modules/logger');

class CategoryService {
    static async addCategory(data) {
        try {
            const { name } = data;
            if (!name) {
                return { status: 400, message: 'Category Name is required' };
            }
            const category = new Category({ name });
            const savedCategory = await category.save();
            return { status: 201, message: 'Category added successfully', data: savedCategory };
        } catch (error) {
            logger.error('Error in CategoryService - Add Category:', {
                message: error.message,
                stack: error.stack,
                data
            });
            throw error;
        }
    }

    static async getAllCategories() {
        try {
            const categories = await Category.find({}).exec();
            return { status: 200, message: 'Categories fetched successfully', data: categories };
        } catch (error) {
            logger.error('Error in CategoryService - Get All Categories:', {
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = CategoryService;
