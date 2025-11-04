// scripts/seedDatabase.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

import User from '../models/User.js'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Brand from '../models/Brand.js'
import Review from '../models/Review.js'
import Coupon from '../models/Coupon.js'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
    console.log('MongoDB connected')
  } catch (e) {
    console.error('MongoDB connection error:', e)
    process.exit(1)
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

const publicId = (title) => `${slugify(title)}-${Math.random().toString(36).substr(2, 6)}`

/* ------------------------------------------------------------------ */
/* 1. MAIN CATEGORIES                                                 */
/* ------------------------------------------------------------------ */
const mainCategories = [
  {
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    image: {
      public_id: 'electronics_category',
      url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=300&fit=crop',
    },
    featured: true,
    sortOrder: 1,
  },
  {
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    image: {
      public_id: 'fashion_category',
      url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=300&fit=crop',
    },
    featured: true,
    sortOrder: 2,
  },
  {
    name: 'Home & Living',
    description: 'Furniture and home decor items',
    image: {
      public_id: 'home_living_category',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop',
    },
    featured: true,
    sortOrder: 3,
  },
  {
    name: 'Beauty',
    description: 'Skincare and makeup products',
    image: {
      public_id: 'beauty_category',
      url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=300&fit=crop',
    },
    featured: true,
    sortOrder: 4,
  },
  {
    name: 'Sports',
    description: 'Sports equipment and accessories',
    image: {
      public_id: 'sports_category',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    },
    featured: true,
    sortOrder: 5,
  },
]

/* ------------------------------------------------------------------ */
/* 2. SUBCATEGORIES                                                   */
/* ------------------------------------------------------------------ */
const subcategories = [
  // Electronics
  { name: 'Smartphones', parent: 'Electronics', description: 'Latest smartphones', featured: true },
  { name: 'Laptops', parent: 'Electronics', description: 'Powerful laptops', featured: true },
  { name: 'Headphones', parent: 'Electronics', description: 'High-quality audio', featured: false },
  { name: 'Cameras', parent: 'Electronics', description: 'Digital cameras', featured: false },
  { name: 'Smartwatches', parent: 'Electronics', description: 'Smart wearables', featured: true },
  { name: 'Tablets', parent: 'Electronics', description: 'Portable tablets', featured: false },

  // Fashion
  {
    name: "Men's Clothing",
    parent: 'Fashion',
    description: 'Stylish clothing for men',
    featured: true,
  },
  {
    name: "Women's Clothing",
    parent: 'Fashion',
    description: 'Elegant clothing for women',
    featured: true,
  },
  { name: 'Shoes', parent: 'Fashion', description: 'Comfortable footwear', featured: true },
  { name: 'Accessories', parent: 'Fashion', description: 'Fashion accessories', featured: false },
  { name: 'Bags', parent: 'Fashion', description: 'Handbags and backpacks', featured: false },
  { name: 'Watches', parent: 'Fashion', description: 'Luxury watches', featured: true },

  // Home & Living
  { name: 'Furniture', parent: 'Home & Living', description: 'Modern furniture', featured: true },
  { name: 'Home Decor', parent: 'Home & Living', description: 'Decoration items', featured: false },
  {
    name: 'Kitchen & Dining',
    parent: 'Home & Living',
    description: 'Kitchen appliances',
    featured: true,
  },
  { name: 'Bed & Bath', parent: 'Home & Living', description: 'Bedding and bath', featured: false },
  { name: 'Lighting', parent: 'Home & Living', description: 'Lighting solutions', featured: false },

  // Beauty
  { name: 'Skincare', parent: 'Beauty', description: 'Healthy skin products', featured: true },
  { name: 'Makeup', parent: 'Beauty', description: 'Cosmetics', featured: false },
  { name: 'Fragrances', parent: 'Beauty', description: 'Perfumes', featured: false },
  { name: 'Hair Care', parent: 'Beauty', description: 'Hair treatments', featured: true },

  // Sports
  { name: 'Fitness', parent: 'Sports', description: 'Fitness gear', featured: true },
  { name: 'Outdoor', parent: 'Sports', description: 'Adventure gear', featured: false },
  { name: 'Team Sports', parent: 'Sports', description: 'Team equipment', featured: false },
  { name: 'Water Sports', parent: 'Sports', description: 'Swimming gear', featured: false },
]

/* ------------------------------------------------------------------ */
/* 3. BRANDS                                                          */
/* ------------------------------------------------------------------ */
const brands = [
  {
    name: 'Apple',
    description: 'Innovative tech',
    logo: {
      url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop',
    },
    banner: {
      url: 'https://images.unsplash.com/photo-1577375729078-820d5283031c?w=800&h=400&fit=crop',
    },
    website: 'https://apple.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'USA',
    foundedYear: 1976,
  },
  {
    name: 'Samsung',
    description: 'Global electronics',
    logo: {
      url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop',
    },
    banner: {
      url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=400&fit=crop',
    },
    website: 'https://samsung.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'South Korea',
    foundedYear: 1938,
  },
  {
    name: 'Sony',
    description: 'Premium electronics',
    logo: {
      url: 'https://images.unsplash.com/photo-1604580864964-5e0e2d5c738c?w=200&h=200&fit=crop',
    },
    banner: {
      url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&h=400&fit=crop',
    },
    website: 'https://sony.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'Japan',
    foundedYear: 1946,
  },
  {
    name: 'Nike',
    description: 'Athletic footwear',
    logo: { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop' },
    banner: {
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=400&fit=crop',
    },
    website: 'https://nike.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'USA',
    foundedYear: 1964,
  },
  {
    name: 'Adidas',
    description: 'Performance sports',
    logo: { url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=200&h=200&fit=crop' },
    banner: {
      url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&h=400&fit=crop',
    },
    website: 'https://adidas.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'Germany',
    foundedYear: 1949,
  },
  {
    name: 'Zara',
    description: 'Fast fashion',
    logo: {
      url: 'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=200&h=200&fit=crop',
    },
    banner: {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    },
    website: 'https://zara.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'Spain',
    foundedYear: 1974,
  },
  {
    name: 'IKEA',
    description: 'Affordable furniture',
    logo: { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=200&h=200&fit=crop' },
    banner: {
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop',
    },
    website: 'https://ikea.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'Sweden',
    foundedYear: 1943,
  },
  {
    name: "L'Oréal",
    description: 'Beauty products',
    logo: {
      url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
    },
    banner: {
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=400&fit=crop',
    },
    website: 'https://loreal.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'France',
    foundedYear: 1909,
  },
  {
    name: 'Dell',
    description: 'Laptops & PCs',
    logo: {
      url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&h=200&fit=crop',
    },
    banner: {
      url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=400&fit=crop',
    },
    website: 'https://dell.com',
    isVerified: true,
    isFeatured: true,
    originCountry: 'USA',
    foundedYear: 1984,
  },
  {
    name: 'Canon',
    description: 'Cameras & printers',
    logo: {
      url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop',
    },
    banner: {
      url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=400&fit=crop',
    },
    website: 'https://canon.com',
    isVerified: true,
    isFeatured: false,
    originCountry: 'Japan',
    foundedYear: 1937,
  },
]

/* ------------------------------------------------------------------ */
/* 4. COUPONS                                                         */
/* ------------------------------------------------------------------ */
const coupons = [
  {
    code: 'WELCOME10',
    name: 'Welcome Discount',
    description: '10% off your first order',
    discountType: 'percentage',
    discountValue: 10,
    minimumAmount: 0,
    maximumDiscount: 50,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageLimit: 1000,
    usedCount: 0,
    perUserLimit: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'FREESHIP',
    name: 'Free Shipping',
    description: 'Free shipping on any order',
    discountType: 'free_shipping',
    discountValue: 0,
    minimumAmount: 0,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageLimit: 500,
    usedCount: 0,
    perUserLimit: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

/* ------------------------------------------------------------------ */
/* 5. 100 PRODUCTS (with 10 top-sellers)                              */
/* ------------------------------------------------------------------ */
const generateProducts = () => {
  const baseProducts = [
    // === TOP SELLERS (10) ===
    {
      title: 'iPhone 15 Pro Max',
      price: 1199,
      comparePrice: 1399,
      brand: 'Apple',
      category: 'Smartphones',
      img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop',
      salesCount: 1250,
      isFeatured: true,
    },
    {
      title: 'Samsung Galaxy S24 Ultra',
      price: 1299,
      comparePrice: 1499,
      brand: 'Samsung',
      category: 'Smartphones',
      img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop',
      salesCount: 1100,
      isFeatured: true,
    },
    {
      title: 'Nike Air Jordan 1 Retro',
      price: 180,
      comparePrice: 220,
      brand: 'Nike',
      category: 'Shoes',
      img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
      salesCount: 980,
      isFeatured: true,
    },
    {
      title: 'MacBook Pro 16" M3 Max',
      price: 3499,
      comparePrice: 3899,
      brand: 'Apple',
      category: 'Laptops',
      img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
      salesCount: 850,
      isFeatured: true,
    },
    {
      title: 'Sony WH-1000XM5',
      price: 399,
      comparePrice: 449,
      brand: 'Sony',
      category: 'Headphones',
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      salesCount: 790,
      isFeatured: true,
    },
    {
      title: 'Adidas Ultraboost 22',
      price: 190,
      comparePrice: 220,
      brand: 'Adidas',
      category: 'Shoes',
      img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&h=500&fit=crop',
      salesCount: 720,
      isFeatured: true,
    },
    {
      title: 'IKEA MALM Bed Frame Queen',
      price: 299,
      comparePrice: 349,
      brand: 'IKEA',
      category: 'Furniture',
      img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=500&fit=crop',
      salesCount: 680,
      isFeatured: true,
    },
    {
      title: "L'Oréal Revitalift Cream",
      price: 24.99,
      comparePrice: 29.99,
      brand: "L'Oréal",
      category: 'Skincare',
      img: 'https://images.unsplash.com/photo-1556228578-8cb49c6d6e7c?w=500&h=500&fit=crop',
      salesCount: 620,
      isFeatured: true,
    },
    {
      title: 'Apple AirPods Max',
      price: 549,
      comparePrice: 599,
      brand: 'Apple',
      category: 'Headphones',
      img: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&h=500&fit=crop',
      salesCount: 590,
      isFeatured: true,
    },
    {
      title: 'Zara Floral Summer Dress',
      price: 59,
      comparePrice: 79,
      brand: 'Zara',
      category: "Women's Clothing",
      img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
      salesCount: 560,
      isFeatured: true,
    },

    // === REGULAR PRODUCTS (90 more) ===
    {
      title: 'Google Pixel 8 Pro',
      price: 999,
      comparePrice: 1199,
      brand: 'Google',
      category: 'Smartphones',
      img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
    },
    {
      title: 'OnePlus 12',
      price: 799,
      comparePrice: 899,
      brand: 'OnePlus',
      category: 'Smartphones',
      img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
    },
    {
      title: 'Dell XPS 15',
      price: 1899,
      comparePrice: 2199,
      brand: 'Dell',
      category: 'Laptops',
      img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
    },
    {
      title: 'Canon EOS R6',
      price: 2499,
      comparePrice: 2799,
      brand: 'Canon',
      category: 'Cameras',
      img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop',
    },
    {
      title: 'Apple Watch Ultra 2',
      price: 799,
      comparePrice: 899,
      brand: 'Apple',
      category: 'Smartwatches',
      img: 'https://images.unsplash.com/photo-1579586339913-0ddeda2af379?w=500&h=500&fit=crop',
    },
    {
      title: 'Samsung Galaxy Watch 6',
      price: 399,
      comparePrice: 449,
      brand: 'Samsung',
      category: 'Smartwatches',
      img: 'https://images.unsplash.com/photo-1575311372199-008c4c2f8a3f?w=500&h=500&fit=crop',
    },
    {
      title: 'Bose QuietComfort 45',
      price: 329,
      comparePrice: 379,
      brand: 'Bose',
      category: 'Headphones',
      img: 'https://images.unsplash.com/photo-1613040809024-b864fcf4a386?w=500&h=500&fit=crop',
    },
    {
      title: 'Nike React Element 55',
      price: 130,
      comparePrice: 160,
      brand: 'Nike',
      category: 'Shoes',
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop',
    },
    {
      title: 'Adidas NMD R1',
      price: 140,
      comparePrice: 170,
      brand: 'Adidas',
      category: 'Shoes',
      img: 'https://images.unsplash.com/photo-1600269456128-1f36a565a9d6?w=500&h=500&fit=crop',
    },
    {
      title: 'Zara Denim Jacket',
      price: 89,
      comparePrice: 119,
      brand: 'Zara',
      category: "Men's Clothing",
      img: 'https://images.unsplash.com/photo-1551028719-00167b16eac9?w=500&h=500&fit=crop',
    },
    {
      title: 'Zara Linen Shirt',
      price: 49,
      comparePrice: 69,
      brand: 'Zara',
      category: "Men's Clothing",
      img: 'https://images.unsplash.com/photo-1596755095175-2c6e6d5d2a0a?w=500&h=500&fit=crop',
    },
    {
      title: 'IKEA POÄNG Armchair',
      price: 199,
      comparePrice: 249,
      brand: 'IKEA',
      category: 'Furniture',
      img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
    },
    {
      title: 'IKEA KALLAX Shelf',
      price: 79,
      comparePrice: 99,
      brand: 'IKEA',
      category: 'Furniture',
      img: 'https://images.unsplash.com/photo-1558618666-f7e6c9c4d3a4?w=500&h=500&fit=crop',
    },
    {
      title: 'Dyson V15 Vacuum',
      price: 699,
      comparePrice: 799,
      brand: 'Dyson',
      category: 'Kitchen & Dining',
      img: 'https://images.unsplash.com/photo-1558618666-f7e6c9c4d3a4?w=500&h=500&fit=crop',
    },
    {
      title: 'Nespresso Vertuo',
      price: 199,
      comparePrice: 249,
      brand: 'Nespresso',
      category: 'Kitchen & Dining',
      img: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500&h=500&fit=crop',
    },
    {
      title: 'The Ordinary Niacinamide',
      price: 6.99,
      comparePrice: 9.99,
      brand: 'The Ordinary',
      category: 'Skincare',
      img: 'https://images.unsplash.com/photo-1591370894552-90d5e0e0d1a0?w=500&h=500&fit=crop',
    },
    {
      title: 'CeraVe Moisturizing Cream',
      price: 17.99,
      comparePrice: 22.99,
      brand: 'CeraVe',
      category: 'Skincare',
      img: 'https://images.unsplash.com/photo-1598662957563-5b7f0d0e3c8d?w=500&h=500&fit=crop',
    },
    {
      title: 'Bowflex Adjustable Dumbbells',
      price: 399,
      comparePrice: 499,
      brand: 'Bowflex',
      category: 'Fitness',
      img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    },
    {
      title: 'YETI Rambler 30 oz',
      price: 38,
      comparePrice: 48,
      brand: 'YETI',
      category: 'Outdoor',
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop',
    },
    {
      title: 'Ray-Ban Aviator Sunglasses',
      price: 175,
      comparePrice: 210,
      brand: 'Ray-Ban',
      category: 'Accessories',
      img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop',
    },
  ]

  // Fill to 100
  const allProducts = []
  for (let i = 0; i < 100; i++) {
    const item = baseProducts[i % baseProducts.length]
    const pid = publicId(item.title + (i >= baseProducts.length ? `-${i}` : ''))
    const isTopSeller = i < 10

    allProducts.push({
      title: i >= baseProducts.length ? `${item.title} #${i + 1}` : item.title,
      slug: slugify(item.title + (i >= baseProducts.length ? `-${i}` : '')).slice(0, 60),
      description: `${item.title} – premium quality from ${item.brand}. Fast shipping & warranty.`,
      shortDescription: `Best-selling ${item.category.toLowerCase()}.`,
      price: item.price,
      comparePrice: item.comparePrice,
      category: item.category,
      brand: item.brand,
      images: [{ public_id: pid, url: item.img, isPrimary: true }],
      inventory: {
        trackQuantity: true,
        quantity: isTopSeller
          ? Math.floor(Math.random() * 50) + 100
          : Math.floor(Math.random() * 100) + 20,
        lowStockAlert: 10,
      },
      variants: [
        {
          size: 'Standard',
          color: 'Default',
          stock: Math.floor(Math.random() * 60) + 10,
          price: item.price,
          sku: `SKU-${Date.now().toString(36).toUpperCase()}-${Math.random()
            .toString(36)
            .substr(2, 4)
            .toUpperCase()}`,
        },
      ],
      features: ['Premium Quality', 'Fast Delivery', '1-Year Warranty'],
      specifications: {
        weight: `${(Math.random() * 3 + 0.5).toFixed(2)}kg`,
        dimensions: '30×20×10 cm',
        warranty: '2 years',
      },
      tags: [item.category.toLowerCase(), item.brand.toLowerCase()],
      shipping: { weight: 1.2, freeShipping: item.price > 50 },
      isFeatured: isTopSeller || Math.random() > 0.85,
      isActive: true,
      salesCount: isTopSeller
        ? item.salesCount + Math.floor(Math.random() * 200)
        : Math.floor(Math.random() * 300),
    })
  }

  return allProducts
}

/* ------------------------------------------------------------------ */
/* MAIN SEED FUNCTION                                                 */
/* ------------------------------------------------------------------ */
const seedDatabase = async () => {
  try {
    await connectDB()

    console.log('Clearing collections...')
    await Promise.all([
      // User.deleteMany({}),
      // Product.deleteMany({}),
      // Category.deleteMany({}),
      // Brand.deleteMany({}),
      // Review.deleteMany({}),
      Coupon.deleteMany({}),
    ])

    // 1. Main Categories
    console.log('Creating main categories...')
    const mainWithSlug = mainCategories.map((c) => ({
      ...c,
      slug: slugify(c.name),
      isActive: true,
      parent: null,
    }))
    // const createdMain = await Category.insertMany(mainWithSlug)
    // const catMap = {}
    // createdMain.forEach((c) => (catMap[c.name] = c._id))

    // 2. Subcategories
    // console.log('Creating subcategories...')
    // const subWithSlug = subcategories.map((s) => ({
    //   ...s,
    //   slug: slugify(s.name),
    //   parent: catMap[s.parent],
    //   image: {
    //     public_id: `${slugify(s.name)}-cat`,
    //     url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop',
    //   },
    //   isActive: true,
    //   featured: s.featured ?? false,
    // }))
    // await Category.insertMany(subWithSlug)

    // 3. Brands
    // console.log('Creating brands...')
    // const brandsWithSlug = brands.map((b) => ({
    //   ...b,
    //   slug: slugify(b.name),
    //   isActive: true,
    //   followerCount: 0,
    //   productCount: 0,
    // }))
    // await Brand.insertMany(brandsWithSlug)

    // 4. Users
    // console.log('Creating users...')
    // const users = [
    //   {
    //     name: 'John Doe',
    //     email: 'john@example.com',
    //     password: await bcrypt.hash('password123', 12),
    //     role: 'user',
    //     avatar: {
    //       url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    //     },
    //   },
    //   {
    //     name: 'Jane Smith',
    //     email: 'jane@example.com',
    //     password: await bcrypt.hash('password123', 12),
    //     role: 'user',
    //     avatar: {
    //       url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    //     },
    //   },
    //   {
    //     name: 'Admin User',
    //     email: 'admin@example.com',
    //     password: await bcrypt.hash('admin123', 12),
    //     role: 'admin',
    //     avatar: {
    //       url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    //     },
    //   },
    // ]
    // const createdUsers = await User.insertMany(users)

    // 5. Coupons
    console.log('Creating coupons...')
    await Coupon.insertMany(coupons)

    // 6. Products (100)
    // console.log('Creating 100 products...')
    // const rawProducts = generateProducts()
    // const createdProducts = await Product.insertMany(rawProducts)

    // // 7. Reviews - FIXED VERSION (بدون duplicates)
    // console.log('Creating reviews...')
    // const reviews = []
    // const userProductPairs = new Set()

    // for (const prod of createdProducts) {
    //   const reviewCount =
    //     prod.salesCount > 500
    //       ? Math.floor(Math.random() * 20) + 15
    //       : Math.floor(Math.random() * 10) + 3

    //   let createdReviewsForProduct = 0

    //   for (let i = 0; i < reviewCount && createdReviewsForProduct < 3; i++) {
    //     const user = createdUsers[Math.floor(Math.random() * createdUsers.length)]
    //     const pairKey = `${user._id}-${prod._id}`

    //     // تأكد إن كل user ممكن يعمل review واحد فقط لكل product
    //     if (!userProductPairs.has(pairKey)) {
    //       userProductPairs.add(pairKey)
    //       createdReviewsForProduct++

    //       reviews.push({
    //         user: user._id,
    //         product: prod._id,
    //         rating: Math.floor(Math.random() * 2) + 4, // 4 أو 5 stars فقط
    //         title: ['Amazing!', 'Love it!', 'Worth every penny', 'Fast delivery'][
    //           Math.floor(Math.random() * 4)
    //         ],
    //         comment: 'High quality, exactly as described. Will buy again!',
    //         isVerified: Math.random() > 0.3,
    //         likes: Math.floor(Math.random() * 80),
    //       })
    //     }
    //   }
    // }

    // استخدم insertMany مع ordered: false علشان نتخطى الـ duplicates
    // try {
    //   await Review.insertMany(reviews, { ordered: false })
    //   console.log(`Created ${reviews.length} reviews successfully`)
    // } catch (err) {
    //   if (err.code === 11000) {
    //     console.log(
    //       `Created ${err.result?.insertedCount || reviews.length} reviews (some duplicates skipped)`
    //     )
    //   } else {
    //     throw err
    //   }
    // }

    // // 8. Update ratings
    // console.log('Updating product ratings...')
    // for (const prod of createdProducts) {
    //   const revs = await Review.find({ product: prod._id })
    //   if (revs.length) {
    //     const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length
    //     const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    //     revs.forEach((r) => dist[r.rating]++)
    //     await Product.findByIdAndUpdate(prod._id, {
    //       'rating.average': Number(avg.toFixed(1)),
    //       'rating.count': revs.length,
    //       'rating.distribution': dist,
    //     })
    //   }
    // }

    console.log('\nSeeding completed!')
    console.log(`Products: ${createdProducts.length} (10 top-sellers)`)
    console.log(`Reviews: ${reviews.length}`)
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seedDatabase()
