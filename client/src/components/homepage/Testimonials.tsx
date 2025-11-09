// components/homepage/Testimonials.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Testimonial {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  product?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const defaultTestimonials = [
    {
      _id: '1',
      user: { name: 'Sarah Johnson' },
      rating: 5,
      comment: 'The quality of products exceeded my expectations. Fast shipping and excellent customer service! Will definitely shop here again.',
      product: 'Summer Dress Collection'
    },
    {
      _id: '2',
      user: { name: 'Mike Chen' },
      rating: 5,
      comment: 'Found exactly what I was looking for at a great price. The entire shopping experience was smooth and enjoyable.',
      product: 'Electronics Bundle'
    },
    {
      _id: '3',
      user: { name: 'Emily Davis' },
      rating: 5,
      comment: 'Love the unique selection of products. Customer support was incredibly helpful throughout my purchase journey.',
      product: 'Home Decor Items'
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials.slice(0, 3) : defaultTestimonials;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.4
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={headerVariants}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            💫 Customer Love
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            What Our Customers Say
          </motion.h2>

          <motion.p
            className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed"
            whileHover={{ scale: 1.01 }}
          >
            Don&apos;t just take our word for it - hear from our satisfied customers worldwide
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {displayTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial._id}
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col">

                {/* Rating Stars */}
                <motion.div
                  className="flex items-center gap-1 mb-6"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      className={`w-6 h-6 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-200'
                      }`}
                      viewBox="0 0 20 20"
                      whileHover={{ scale: 1.2, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </motion.div>

                {/* Comment */}
                <blockquote className="text-gray-700 mb-8 leading-relaxed text-lg flex-grow">
                  &ldquo;{testimonial.comment}&rdquo;
                </blockquote>

                {/* User Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <motion.div
                    className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    whileHover={{
                      scale: 1.1,
                      rotate: 360,
                      transition: { duration: 0.5 }
                    }}
                  >
                    {testimonial.user.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg">
                      {testimonial.user.name}
                    </div>
                    {testimonial.product && (
                      <div className="text-sm text-gray-500 mt-1">
                        Purchased: <span className="text-blue-600 font-medium">{testimonial.product}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quote Icon */}
                <motion.div
                  className="absolute top-6 right-6 text-blue-100 group-hover:text-blue-200 transition-colors duration-300"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                  </svg>
                </motion.div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>

              {/* Floating Element */}
              <motion.div
                className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={statsVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { value: "4.9/5", label: "Average Rating", icon: "⭐" },
            { value: "10K+", label: "Happy Customers", icon: "😊" },
            { value: "98%", label: "Recommend Us", icon: "💫" },
            { value: "24/7", label: "Support", icon: "🛡️" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.3 }
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div
                className="text-2xl mb-2"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5
                }}
              >
                {stat.icon}
              </motion.div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
