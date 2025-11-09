// // utils/apiFeatures.js
// class ApiFeatures {
//   constructor(query, queryString) {
//     this.query = query
//     this.queryString = queryString
//     this.filterQuery = { isActive: true } // Always filter active products
//   }

//   filter() {
//     const queryObj = { ...this.queryString }
//     const excludedFields = [
//       'page',
//       'sort',
//       'limit',
//       'fields',
//       'search',
//       'minPrice',
//       'maxPrice',
//       'tags',
//       'colors',
//       'sizes',
//       'brand',
//       'category',
//       'featured',
//     ]

//     excludedFields.forEach((el) => delete queryObj[el])

//     // Advanced filtering for basic fields
//     let queryStr = JSON.stringify(queryObj)
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

//     // Initialize filter query
//     const parsedQueryStr = queryStr ? JSON.parse(queryStr) : {}
//     this.filterQuery = { ...parsedQueryStr, ...this.filterQuery }

//     // Price filtering
//     if (this.queryString.minPrice || this.queryString.maxPrice) {
//       const priceFilter = {}
//       if (this.queryString.minPrice) priceFilter.$gte = Number(this.queryString.minPrice)
//       if (this.queryString.maxPrice) priceFilter.$lte = Number(this.queryString.maxPrice)

//       if (Object.keys(priceFilter).length > 0) {
//         this.filterQuery.price = priceFilter
//       }
//     }

//     // Category filtering
//     if (this.queryString.category && this.queryString.category !== 'All') {
//       this.filterQuery.category = this.queryString.category
//     }

//     // Brand filtering
//     if (this.queryString.brand) {
//       const brands = Array.isArray(this.queryString.brand)
//         ? this.queryString.brand
//         : [this.queryString.brand]
//       this.filterQuery.brand = { $in: brands }
//     }

//     // Tags filtering
//     if (this.queryString.tags) {
//       const tags = Array.isArray(this.queryString.tags)
//         ? this.queryString.tags
//         : [this.queryString.tags]
//       this.filterQuery.tags = { $in: tags }
//     }

//     // Colors filtering - using variants array
//     if (this.queryString.colors) {
//       const colors = Array.isArray(this.queryString.colors)
//         ? this.queryString.colors
//         : [this.queryString.colors]
//       this.filterQuery['variants.color'] = { $in: colors }
//     }

//     // Sizes filtering - using variants array
//     if (this.queryString.sizes) {
//       const sizes = Array.isArray(this.queryString.sizes)
//         ? this.queryString.sizes
//         : [this.queryString.sizes]
//       this.filterQuery['variants.size'] = { $in: sizes }
//     }
//     if (this.queryString.featured) {
//       this.filterQuery.featured = this.queryString.featured === 'true'
//     }

//     this.query = this.query.find(this.filterQuery)
//     return this
//   }

//   search() {
//     if (this.queryString.search) {
//       const searchRegex = new RegExp(this.queryString.search, 'i')
//       const searchFilter = {
//         $or: [
//           { title: searchRegex },
//           { description: searchRegex },
//           { tags: searchRegex },
//           { brand: searchRegex },
//           { category: searchRegex },
//         ],
//       }

//       this.query = this.query.find(searchFilter)

//       // Update filterQuery for accurate count
//       if (this.filterQuery.$or) {
//         this.filterQuery.$or = [...this.filterQuery.$or, ...searchFilter.$or]
//       } else {
//         this.filterQuery.$or = searchFilter.$or
//       }
//     }
//     return this
//   }

//   sort() {
//     if (this.queryString.sort) {
//       const sortMapping = {
//         popular: '-rating.average -salesCount',
//         newest: '-createdAt',
//         'price-low': 'price',
//         'price-high': '-price',
//         rating: '-rating.average',
//       }

//       const sortBy = sortMapping[this.queryString.sort] || '-createdAt'
//       this.query = this.query.sort(sortBy)
//     } else {
//       this.query = this.query.sort('-createdAt')
//     }
//     return this
//   }

//   limitFields() {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(',').join(' ')
//       this.query = this.query.select(fields)
//     } else {
//       this.query = this.query.select('-__v')
//     }
//     return this
//   }

//   paginate() {
//     const page = this.queryString.page * 1 || 1
//     const limit = this.queryString.limit * 1 || 12
//     const skip = (page - 1) * limit

//     this.page = page
//     this.limit = limit
//     this.query = this.query.skip(skip).limit(limit)

//     return this
//   }
// }

// export default ApiFeatures

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
    this.filterQuery = { isActive: true } // Always filter active products
  }

  filter() {
    const queryObj = { ...this.queryString }
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'search',
      'minPrice',
      'maxPrice',
      'tags',
      'colors',
      'sizes',
      'brand',
      'category',
      'featured', // Add featured to excluded fields
    ]

    excludedFields.forEach((el) => delete queryObj[el])

    // Advanced filtering for basic fields
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    // Initialize filter query
    const parsedQueryStr = queryStr ? JSON.parse(queryStr) : {}
    this.filterQuery = { ...parsedQueryStr, ...this.filterQuery }

    // Price filtering
    if (this.queryString.minPrice || this.queryString.maxPrice) {
      const priceFilter = {}
      if (this.queryString.minPrice) priceFilter.$gte = Number(this.queryString.minPrice)
      if (this.queryString.maxPrice) priceFilter.$lte = Number(this.queryString.maxPrice)

      if (Object.keys(priceFilter).length > 0) {
        this.filterQuery.price = priceFilter
      }
    }

    // Category filtering
    if (this.queryString.category && this.queryString.category !== 'All') {
      this.filterQuery.category = this.queryString.category
    }

    // Brand filtering
    if (this.queryString.brand) {
      const brands = Array.isArray(this.queryString.brand)
        ? this.queryString.brand
        : [this.queryString.brand]
      this.filterQuery.brand = { $in: brands }
    }

    // Tags filtering
    if (this.queryString.tags) {
      const tags = Array.isArray(this.queryString.tags)
        ? this.queryString.tags
        : [this.queryString.tags]
      this.filterQuery.tags = { $in: tags }
    }

    // Colors filtering - using variants array
    if (this.queryString.colors) {
      const colors = Array.isArray(this.queryString.colors)
        ? this.queryString.colors
        : [this.queryString.colors]
      this.filterQuery['variants.color'] = { $in: colors }
    }

    // Sizes filtering - using variants array
    if (this.queryString.sizes) {
      const sizes = Array.isArray(this.queryString.sizes)
        ? this.queryString.sizes
        : [this.queryString.sizes]
      this.filterQuery['variants.size'] = { $in: sizes }
    }

    // Featured filtering - NEW: Handle featured products
    if (this.queryString.featured) {
      this.filterQuery.featured = this.queryString.featured === 'true'
    }

    this.query = this.query.find(this.filterQuery)
    return this
  }

  search() {
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, 'i')
      const searchFilter = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
          { brand: searchRegex },
          { category: searchRegex },
        ],
      }

      this.query = this.query.find(searchFilter)

      // Update filterQuery for accurate count
      if (this.filterQuery.$or) {
        this.filterQuery.$or = [...this.filterQuery.$or, ...searchFilter.$or]
      } else {
        this.filterQuery.$or = searchFilter.$or
      }
    }
    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortMapping = {
        popular: '-rating.average -salesCount',
        newest: '-createdAt',
        'price-low': 'price',
        'price-high': '-price',
        rating: '-rating.average',
      }

      const sortBy = sortMapping[this.queryString.sort] || '-createdAt'
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }
    return this
  }

  paginate() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 12
    const skip = (page - 1) * limit

    this.page = page
    this.limit = limit
    this.query = this.query.skip(skip).limit(limit)

    return this
  }
}

export default ApiFeatures
