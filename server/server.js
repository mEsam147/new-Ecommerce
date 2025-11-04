// server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import connectDatabase from './config/database.js'
import errorHandler from './middleware/error.js'
import ApiError from './utils/ApiError.js'

// Route imports
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import productRoutes from './routes/products.js'
import brandroutes from './routes/brands.js'

import categoryRoutes from './routes/categories.js'
import cartRoutes from './routes/carts.js'
import orderRoutes from './routes/orders.js'
import reviewRoutes from './routes/reviews.js'
import paymentRoutes from './routes/payments.js'
import couponRoutes from './routes/coupons.js'
import addressRoutes from './routes/addresses.js'
import analyticsRoutes from './routes/analytics.js'
import wishlistRoutes from './routes/wishlists.js'
import paymentMethodsRoutes from './routes/paymentMethods.js'

// Load env vars
dotenv.config()

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to database
connectDatabase()

const app = express()

// Security middleware
app.use(helmet())

app.use(cookieParser()) // Add this line

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api', limiter)

// Body parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp())

// CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // This is CRITICAL for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
)

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/brands', brandroutes)

app.use('/api/categories', categoryRoutes)
app.use('/api/carts', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/payments', paymentRoutes)

app.use('/api/payment-methods', paymentMethodsRoutes)

app.use('/api/coupons', couponRoutes)

app.use('/api/addresses', addressRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/reviews', reviewRoutes)

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`))
})

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err)
  server.close(() => {
    process.exit(1)
  })
})

export default app
