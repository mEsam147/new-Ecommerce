// components/products/ProductImageGallery.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
    public_id: string;
  }>;
  selectedImage: number;
  onSelectImage: (index: number) => void;
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  selectedImage,
  onSelectImage,
  productName
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const currentImage = images[selectedImage];

  const nextImage = () => {
    onSelectImage((selectedImage + 1) % images.length);
    setIsZoomed(false); // Reset zoom when changing images
  };

  const prevImage = () => {
    onSelectImage((selectedImage - 1 + images.length) % images.length);
    setIsZoomed(false); // Reset zoom when changing images
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Constrain position to prevent zoom area from going outside image bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    setZoomPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!currentImage) return null;

  return (
    <>
      <div className="space-y-4">
        {/* Main Image with Zoom */}
        <div
          ref={imageRef}
          className={cn(
            "relative aspect-square overflow-hidden rounded-xl bg-muted transition-all duration-500",
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          )}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleZoom}
        >
          {/* Zoom Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(selectedImage);
                }}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </DialogTrigger>
          </Dialog>

          {/* Main Image Container */}
          <div className="relative w-full h-full">
            {/* Base Image (Always visible) */}
            <Image
              src={currentImage.url}
              alt={currentImage.alt || productName}
              fill
              className={cn(
                "object-cover transition-transform duration-700 ease-out",
                isZoomed ? "scale-110 opacity-40" : "scale-100 opacity-100"
              )}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            {/* Zoomed Image Layer */}
            {isZoomed && (
              <div
                className="absolute inset-0 overflow-hidden rounded-xl"
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-100 ease-out"
                  style={{
                    transform: 'scale(2.5)', // Zoom level
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                >
                  <Image
                    src={currentImage.url}
                    alt={currentImage.alt || productName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Zoom Lens Overlay (Visual indicator) */}
                <div
                  className="absolute w-32 h-32 border-2 border-white/80 rounded-lg pointer-events-none z-10 shadow-2xl transition-all duration-150 ease-out"
                  style={{
                    left: `calc(${zoomPosition.x}% - 4rem)`,
                    top: `calc(${zoomPosition.y}% - 4rem)`,
                    opacity: isZoomed ? 1 : 0,
                    transform: isZoomed ? 'scale(1)' : 'scale(0.8)',
                  }}
                >
                  {/* Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-white/60"></div>
                    <div className="absolute w-px h-full bg-white/60"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Zoom Hint Overlay */}
            {!isZoomed && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-xl">
                <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transform translate-y-2 hover:translate-y-0 transition-transform duration-300">
                  Hover to zoom • Click to toggle
                </div>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 hover:scale-110 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 hover:scale-110 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Zoom Status Indicator */}
          <div className={cn(
            "absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-500",
            isZoomed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            Zoom: {Math.round(zoomPosition.x)}%, {Math.round(zoomPosition.y)}%
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={image.public_id}
                onClick={() => {
                  onSelectImage(index);
                  setIsZoomed(false);
                }}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 group",
                  selectedImage === index
                    ? "border-primary scale-105 shadow-lg"
                    : "border-transparent hover:border-muted-foreground hover:scale-102"
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />

                {/* Selected indicator */}
                {selectedImage === index && (
                  <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox with Enhanced Animations */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black border-0 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {images[lightboxIndex] && (
              <Image
                src={images[lightboxIndex].url}
                alt={images[lightboxIndex].alt || productName}
                width={1200}
                height={1200}
                className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out"
                style={{
                  transform: `scale(${isZoomed ? 1.2 : 1})`,
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            )}

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/20 backdrop-blur-sm hover:bg-background/40 text-white transition-all duration-300 hover:scale-110"
                  onClick={() => setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/20 backdrop-blur-sm hover:bg-background/40 text-white transition-all duration-300 hover:scale-110"
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Enhanced Thumbnail strip in lightbox */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 backdrop-blur-sm bg-black/40 p-2 rounded-xl">
                {images.map((image, index) => (
                  <button
                    key={image.public_id}
                    onClick={() => setLightboxIndex(index)}
                    className={cn(
                      "relative w-12 h-12 overflow-hidden rounded border-2 transition-all duration-300 transform",
                      lightboxIndex === index
                        ? "border-white scale-110 shadow-lg"
                        : "border-transparent hover:border-white/50 hover:scale-105"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Lightbox Zoom Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/20 backdrop-blur-sm hover:bg-background/40 text-white transition-all duration-300"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductImageGallery;
