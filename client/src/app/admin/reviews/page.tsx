// src/app/admin/reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Review } from '@/types';
import { Search, Filter, Star, Check, X, MessageSquare, User, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    setTimeout(() => {
      setReviews(generateMockReviews());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.product.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'verified' && review.isVerified) ||
                         (statusFilter === 'unverified' && !review.isVerified);

    const matchesRating = ratingFilter === 'all' ||
                         review.rating === parseInt(ratingFilter);

    return matchesSearch && matchesStatus && matchesRating;
  });

  const reviewStats = {
    total: reviews.length,
    verified: reviews.filter(r => r.isVerified).length,
    averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    pending: reviews.filter(r => !r.isVerified).length,
  };

  const approveReview = (reviewId: string) => {
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, isVerified: true } : r
    ));
  };

  const rejectReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-600 mt-2">
            Manage and moderate customer reviews and ratings
          </p>
        </div>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reviews"
          value={reviewStats.total.toString()}
          description="All time"
          icon={<MessageSquare className="w-8 h-8" />}
          color="blue"
        />
        <StatCard
          title="Verified Reviews"
          value={reviewStats.verified.toString()}
          description="Approved reviews"
          icon={<Check className="w-8 h-8" />}
          color="green"
        />
        <StatCard
          title="Average Rating"
          value={reviewStats.averageRating.toFixed(1)}
          description="Out of 5 stars"
          icon={<Star className="w-8 h-8" />}
          color="yellow"
        />
        <StatCard
          title="Pending Review"
          value={reviewStats.pending.toString()}
          description="Need moderation"
          icon={<MessageSquare className="w-8 h-8" />}
          color="orange"
        />
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = (count / reviews.length) * 100;

              return (
                <div key={rating} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search reviews by customer, product, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onApprove={approveReview}
                onReject={rejectReview}
              />
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all'
                  ? 'Try adjusting your search filters'
                  : 'No customer reviews yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
}

function ReviewItem({ review, onApprove, onReject }: ReviewItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {review.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
              {review.isVerified && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                  <Check size={12} />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h5 className="font-medium text-gray-900 mb-1">{review.product.title}</h5>
            <p className="text-gray-600">{review.comment}</p>
          </div>
        </div>

        {!review.isVerified && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(review.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Approve Review"
            >
              <Check size={20} />
            </button>
            <button
              onClick={() => onReject(review.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Reject Review"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Review Metrics */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <ThumbsUp size={16} />
          <span>{review.likes} helpful</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown size={16} />
          <span>{review.dislikes} not helpful</span>
        </div>
        <div className="flex items-center gap-1">
          <User size={16} />
          <span>Purchased product</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon, color }: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Extended Review type
interface ExtendedReview extends Review {
  user: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    title: string;
    image: string;
  };
  likes: number;
  dislikes: number;
}

function generateMockReviews(): ExtendedReview[] {
  const products = [
    { id: '1', title: 'iPhone 15 Pro', image: '/iphone.jpg' },
    { id: '2', title: 'MacBook Air M2', image: '/macbook.jpg' },
    { id: '3', title: 'AirPods Pro', image: '/airpods.jpg' },
    { id: '4', title: 'iPad Air', image: '/ipad.jpg' },
  ];

  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com' },
  ];

  const comments = [
    'Great product! Very satisfied with my purchase.',
    'Good quality but delivery was a bit slow.',
    'Excellent value for money. Would recommend!',
    'Not what I expected. The quality could be better.',
    'Amazing product! Exceeded my expectations.',
    'Decent product for the price. Does the job.',
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const rating = Math.floor(Math.random() * 5) + 1;

    return {
      id: `review-${i + 1}`,
      user,
      product,
      rating,
      comment,
      isVerified: Math.random() > 0.3,
      likes: Math.floor(Math.random() * 50),
      dislikes: Math.floor(Math.random() * 10),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}
