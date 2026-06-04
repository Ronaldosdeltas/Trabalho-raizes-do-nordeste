import type { ProductReview } from '../types';

const REVIEWS_KEY = 'raizes_reviews';

export const reviewService = {
  getReviews(): ProductReview[] {
    const data = localStorage.getItem(REVIEWS_KEY);
    return data ? (JSON.parse(data) as ProductReview[]) : [];
  },

  getProductReviews(productId: number): ProductReview[] {
    return this.getReviews().filter(r => r.productId === productId);
  },

  getOrderReview(userId: string, productId: number, orderId: string): ProductReview | undefined {
    return this.getReviews().find(
      r => r.userId === userId && r.productId === productId && r.orderId === orderId
    );
  },

  addReview(review: ProductReview): void {
    const reviews = this.getReviews();
    reviews.push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  },

  getAverageRating(productId: number): { average: number; count: number } {
    const reviews = this.getProductReviews(productId);
    if (reviews.length === 0) return { average: 0, count: 0 };
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return { average: Math.round(avg * 10) / 10, count: reviews.length };
  },
};
