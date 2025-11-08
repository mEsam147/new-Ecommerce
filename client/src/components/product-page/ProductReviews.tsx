// components/products/ProductReviews.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, ThumbsUp, Calendar, MessageCircle, Send, User } from 'lucide-react';
import { useCreateReviewMutation } from '@/lib/services/reviewsApi';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Product, Review } from '@/types';

interface ProductReviewsProps {
  product: Product;
  reviews: Review[];
  reviewStats: Array<{
    _id: number;
    count: number;
  }>;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  product,
  reviews,
  reviewStats
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState(0);

  // Review mutation
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  const totalReviews = reviews.length;
  const ratingDistribution = {
    5: reviewStats.find(s => s._id === 5)?.count || 0,
    4: reviewStats.find(s => s._id === 4)?.count || 0,
    3: reviewStats.find(s => s._id === 3)?.count || 0,
    2: reviewStats.find(s => s._id === 2)?.count || 0,
    1: reviewStats.find(s => s._id === 1)?.count || 0,
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.helpful - a.helpful;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.rating) {
      toastError('Please select a rating');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toastError('Please write a review comment');
      return;
    }

    try {
      await createReview({
        productId: product._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      }).unwrap();

      success('Review submitted successfully!');
      setReviewDialogOpen(false);
      setReviewForm({ rating: 0, title: '', comment: '' });
    } catch (error: any) {
      console.log("error" , error)
      const errorMessage = error?.data?.error || 'Failed to submit review';
      toastError(errorMessage);
    }
  };

  const resetReviewForm = () => {
    setReviewForm({ rating: 0, title: '', comment: '' });
    setHoverRating(0);
  };

  const StarRating = ({
    rating,
    onRatingChange,
    hoverRating,
    onHoverChange,
    size = 'md'
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    hoverRating?: number;
    onHoverChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const starSize = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }[size];

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange?.(star)}
              onMouseEnter={() => onHoverChange?.(star)}
              onMouseLeave={() => onHoverChange?.(0)}
              className={`transition-transform hover:scale-110 ${
                onRatingChange ? 'cursor-pointer' : 'cursor-default'
              }`}
              disabled={!onRatingChange}
            >
              <Star
                className={`${starSize} ${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{product.rating.average.toFixed(1)}</div>
            <StarRating rating={Math.round(product.rating.average)} size="lg" />
            <div className="text-sm text-muted-foreground mt-2">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Write Review Button */}
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={handleWriteReviewClick}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={product.images[0]?.url}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  </div>
                </div>

                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Rating Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Rating *</label>
                  <div className="flex items-center gap-4">
                    <StarRating
                      rating={reviewForm.rating}
                      onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                      hoverRating={hoverRating}
                      onHoverChange={setHoverRating}
                      size="lg"
                    />
                    <span className="text-sm text-muted-foreground">
                      {reviewForm.rating > 0 && `${reviewForm.rating} out of 5`}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div className="space-y-2">
                  <label htmlFor="review-title" className="text-sm font-medium">
                    Review Title (Optional)
                  </label>
                  <Input
                    id="review-title"
                    placeholder="Summarize your experience..."
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* Review Comment */}
                <div className="space-y-2">
                  <label htmlFor="review-comment" className="text-sm font-medium">
                    Your Review *
                  </label>
                  <Textarea
                    id="review-comment"
                    placeholder="Share your experience with this product. What did you like or dislike?"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters required
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReviewDialogOpen(false);
                      resetReviewForm();
                    }}
                    disabled={isSubmittingReview}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview || !reviewForm.rating || reviewForm.comment.trim().length < 10}
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Sort Controls */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {totalReviews} Review{totalReviews !== 1 ? 's' : ''}
          </h3>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
            >
              Most Recent
            </Button>
            <Button
              variant={sortBy === 'helpful' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('helpful')}
            >
              Most Helpful
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <Card key={review._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* User Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.user.avatar} />
                    <AvatarFallback>
                      {getInitials(review.user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    {/* Review Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold">{review.user.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} size="sm" />
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      {review.title && (
                        <h4 className="font-medium mb-2 text-lg">{review.title}</h4>
                      )}
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Helpful Actions */}
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex items-center gap-2 transition-all ${
                          helpfulReviews.has(review._id)
                            ? 'bg-blue-50 border-blue-200 text-blue-700 scale-105'
                            : 'hover:scale-105'
                        }`}
                        onClick={() => handleHelpfulClick(review._id)}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({helpfulReviews.has(review._id) ? review.likes + 1 : review.likes})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {sortedReviews.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground mb-2">
                  No reviews yet for this product.
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Be the first to share your experience!
                </div>
                <Button onClick={handleWriteReviewClick}>
                  Write the First Review
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
