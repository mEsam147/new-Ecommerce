// components/profile/ReviewsTab.tsx
'use client';

import React, { useState } from 'react';
import { useReviews } from '@/lib/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Star,
  Edit3,
  Trash2,
  ThumbsUp,
  Flag,
  Calendar,
  CheckCircle,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import * as motion from 'framer-motion/client';

export const ReviewsTab: React.FC = () => {
  const {
    reviews,
    stats,
    isLoading,
    deleteReview,
    updateReview,
    toggleLike,
    reportReview,
    editingReview,
    startEditing,
    cancelEditing,
    isDeletingReview,
    isLikingReview,
  } = useReviews();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{ id: string; product: string } | null>(null);
  const [reviewToReport, setReviewToReport] = useState<{ id: string; product: string } | null>(null);
  const [reportReason, setReportReason] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}.0)</span>
      </div>
    );
  };

  // Handle delete confirmation
  const handleDeleteClick = (reviewId: string, productTitle: string) => {
    setReviewToDelete({ id: reviewId, product: productTitle });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (reviewToDelete) {
      await deleteReview(reviewToDelete.id);
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  // Handle report
  const handleReportClick = (reviewId: string, productTitle: string) => {
    setReviewToReport({ id: reviewId, product: productTitle });
    setReportModalOpen(true);
  };

  const handleConfirmReport = async () => {
    if (reviewToReport && reportReason.trim()) {
      await reportReview(reviewToReport.id, reportReason);
      setReportModalOpen(false);
      setReviewToReport(null);
      setReportReason('');
    }
  };

  // Handle like
  const handleLike = async (reviewId: string) => {
    await toggleLike(reviewId);
  };

  if (isLoading) {
    return <ReviewsSkeleton />;
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Reviews Summary */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Review Statistics
              </CardTitle>
              <CardDescription>
                Overview of your review activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalReviews}</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.verifiedReviews || 0}
                  </div>
                  <div className="text-sm text-gray-600">Verified Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {reviews.reduce((acc, review) => acc + (review.likes?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Likes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  My Reviews
                  {reviews.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Manage and view your product reviews
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Likes</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <motion.tr
                        key={review._id}
                        variants={itemVariants}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Product Info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/shop/product/${review.product.slug}`}
                              className="block w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center"
                            >
                              {review.product.images?.[0]?.url ? (
                                <img
                                  src={review.product.images[0].url}
                                  alt={review.product.title}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/shop/product/${review.product.slug}`}
                                className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2 hover:underline"
                              >
                                {review.product.title}
                              </Link>
                            </div>
                          </div>
                        </TableCell>

                        {/* Review Content */}
                        <TableCell>
                          <div className="space-y-2">
                            {review.title && (
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {review.title}
                              </h4>
                            )}
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {review.comment}
                            </p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {review.images.slice(0, 2).map((image, index) => (
                                  <img
                                    key={index}
                                    src={image.url}
                                    alt="Review image"
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                ))}
                                {review.images.length > 2 && (
                                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                                    +{review.images.length - 2}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Rating */}
                        <TableCell className="text-center">
                          {renderStars(review.rating)}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge
                              variant={review.isVerified ? "default" : "outline"}
                              className="text-xs"
                            >
                              {review.isVerified ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </>
                              ) : (
                                'Pending'
                              )}
                            </Badge>
                            {review.isEdited && (
                              <span className="text-xs text-gray-500">Edited</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Likes */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              {review.likes?.length || 0}
                            </span>
                          </div>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(review.createdAt)}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLike(review._id)}
                              disabled={isLikingReview}
                              className="text-green-600 hover:text-green-700 hover:border-green-300"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <Link href={`/shop/product/${review.product.slug}`}>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReportClick(review._id, review.product.title)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Flag className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(review._id, review.product.title)}
                              disabled={isDeletingReview}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't written any reviews yet. Share your experience with products you've purchased to help other shoppers.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/shop">
                      Browse Products
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/orders">
                      View Orders
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Review Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Review
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your review for <strong>"{reviewToDelete?.product}"</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingReview}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeletingReview ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Review Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Flag className="w-5 h-5" />
              Report Review
            </DialogTitle>
            <DialogDescription>
              Why are you reporting this review for <strong>"{reviewToReport?.product}"</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please describe the issue with this review..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setReportModalOpen(false);
                setReportReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleConfirmReport}
              disabled={!reportReason.trim()}
              className="text-orange-600 hover:text-orange-700 hover:border-orange-300"
            >
              <Flag className="w-4 h-4 mr-2" />
              Report Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Reviews Skeleton Component
const ReviewsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Summary Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(7)].map((_, i) => (
                    <TableHead key={i}>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
