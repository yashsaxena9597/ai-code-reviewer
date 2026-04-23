import { Review, type IReview } from '../models/review.model';

export async function saveReview(data: Partial<IReview>): Promise<IReview> {
  const review = new Review(data);
  return review.save();
}

export async function getReviewsByRepo(
  repo: string,
  limit = 20,
  offset = 0,
): Promise<IReview[]> {
  return Review.find({ repo })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .exec();
}

export async function getReviewByPR(
  repo: string,
  pullNumber: number,
): Promise<IReview | null> {
  return Review.findOne({ repo, pullNumber })
    .sort({ createdAt: -1 })
    .exec();
}

export async function getAverageScore(repo: string): Promise<number> {
  const result = await Review.aggregate([
    { $match: { repo } },
    { $group: { _id: null, avgScore: { $avg: '$score' } } },
  ]);
  return result[0]?.avgScore ?? 0;
}
