// components/brands/BrandHeader.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Share2, Heart, Users, MapPin, Verified } from 'lucide-react';
import { useGetBrandBySlugQuery, useFollowBrandMutation, useUnfollowBrandMutation } from '@/lib/services/brandApi';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';

interface BrandHeaderProps {
  initialBrand?: any;
  slug?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ initialBrand, slug }) => {
  // Use RTK Query for client-side updates, but start with initial data
  const { data, isLoading, error } = useGetBrandBySlugQuery(slug!, {
    skip: !slug || !!initialBrand
  });

  const [followBrand] = useFollowBrandMutation();
  const [unfollowBrand] = useUnfollowBrandMutation();
  const { isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();

  // Use server data initially, then client data when available
  const brand = data?.data || initialBrand;

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toastError('Please sign in to follow brands');
      return;
    }

    if (!brand) return;

    try {
      if (brand.isFollowing) {
        await unfollowBrand(brand._id).unwrap();
        success(`Unfollowed ${brand.name}`);
      } else {
        await followBrand(brand._id).unwrap();
        success(`Following ${brand.name}`);
      }
    } catch (error) {
      toastError('Failed to update follow status');
    }
  };

  const handleShare = async () => {
    if (!brand) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: brand.name,
          text: brand.description,
          url: window.location.href,
        });
      } catch (error) {
        // Share cancelled
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  if (isLoading && !brand) {
    return <BrandHeaderSkeleton />;
  }

  if ((error || !brand) && !initialBrand) {
    return (
      <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Brand Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The brand you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <a href="/brands">Browse All Brands</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!brand) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-background to-muted/30 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg p-4 flex items-center justify-center">
              {brand.logo?.url ? (
                <Image
                  src={brand.logo.url}
                  alt={brand.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain"
                />
              ) : (
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {brand.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Brand Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-bold text-foreground">
                    {brand.name}
                  </h1>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {brand.isVerified && (
                      <Badge variant="default" className="bg-green-500 gap-1">
                        <Verified className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                    {brand.isFeatured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                </div>

                {/* Rating and Followers */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {brand.rating && brand.rating.count > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{brand.rating.average.toFixed(1)}</span>
                      <span>({brand.rating.count} reviews)</span>
                    </div>
                  )}

                  {brand.followerCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{brand.followerCount.toLocaleString()} followers</span>
                    </div>
                  )}

                  {brand.originCountry && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{brand.originCountry}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>

                <Button
                  variant={brand.isFollowing ? "default" : "outline"}
                  size="sm"
                  onClick={handleFollow}
                  className="gap-2"
                  disabled={!isAuthenticated}
                >
                  <Heart className={`w-4 h-4 ${brand.isFollowing ? 'fill-current' : ''}`} />
                  {brand.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>

            {/* Description */}
            {brand.description && (
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                {brand.description}
              </p>
            )}

            {/* Categories */}
            {brand.categories && brand.categories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">Categories:</span>
                {brand.categories.map((category: any) => (
                  <Badge key={category._id || category} variant="outline" className="text-sm">
                    {category.name || category}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BrandHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-background to-muted/30 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Logo Skeleton */}
          <Skeleton className="w-32 h-32 rounded-2xl" />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex items-center gap-6">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            <Skeleton className="h-5 w-full max-w-3xl" />
            <Skeleton className="h-5 w-3/4 max-w-3xl" />

            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
