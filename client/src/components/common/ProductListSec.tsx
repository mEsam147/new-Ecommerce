"use client";

import React from "react";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import { Product } from "@/types";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type ProductListSecProps = {
  title: string;
  data: Product[];
  viewAllLink?: string;
};

const ProductListSec = ({ title, data, viewAllLink }: ProductListSecProps) => {
  return (
    <section className="max-w-frame mx-auto text-center">
      {/* ===== Title ===== */}
      <motion.h2
        initial={{ y: "100px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={cn([
          integralCF.className,
          "text-[32px] md:text-5xl mb-8 md:mb-14 capitalize",
        ])}
      >
        {title}
      </motion.h2>

      {/* ===== Carousel Section ===== */}
      <motion.div
        initial={{ y: "100px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="relative group">
          {/* Carousel */}
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full mb-6 md:mb-9 cursor-grab active:cursor-grabbing"
          >
            <CarouselContent className="mx-4 xl:mx-0 space-x-4 sm:space-x-5">
              {data?.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="w-full max-w-[200px] sm:max-w-[300px] pl-0"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Arrows */}
            <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-7 h-7" />
            </CarouselPrevious>
            <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-7 h-7" />
            </CarouselNext>
          </Carousel>
        </div>

        {/* ===== View All Link ===== */}
        {viewAllLink && (
          <div className="w-full px-4 sm:px-0 text-center">
            <Link
              href={viewAllLink}
              className="w-full inline-block sm:w-[218px] px-[54px] py-4 border rounded-full hover:bg-black hover:text-white text-black transition-all font-medium text-sm sm:text-base border-black/10"
            >
              View All
            </Link>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ProductListSec;
