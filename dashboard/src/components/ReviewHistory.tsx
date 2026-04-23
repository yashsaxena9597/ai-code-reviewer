import React from 'react';

interface Review {
  _id: string;
  pullNumber: number;
  score: number;
  grade: string;
  passed: boolean;
  findingsCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  createdAt: string;
}

interface ReviewHistoryProps {
  reviews: Review[];
  repoName: string;
}

const ReviewHistory: React.FC<ReviewHistoryProps> = ({ reviews, repoName }) => {
  if (reviews.length === 0) {
    return <p className="text-gray-400 py-4">No reviews yet for this repository.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-3 px-4 text-gray-400 font-medium">PR</th>
            <th className="py-3 px-4 text-gray-400 font-medium">Score</th>
            <th className="py-3 px-4 text-gray-400 font-medium">Status</th>
            <th className="py-3 px-4 text-gray-400 font-medium">Issues</th>
            <th className="py-3 px-4 text-gray-400 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review._id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="py-3 px-4">
                <a
                  href={`https://github.com/${repoName}/pull/${review.pullNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  #{review.pullNumber}
                </a>
              </td>
              <td className="py-3 px-4">
                <span className="font-bold text-white">{review.score}/10</span>
                <span className="ml-2 text-gray-400">{review.grade}</span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    review.passed
                      ? 'bg-green-900 text-green-300'
                      : 'bg-red-900 text-red-300'
                  }`}
                >
                  {review.passed ? 'Passed' : 'Failed'}
                </span>
              </td>
              <td className="py-3 px-4 text-sm">
                {review.criticalCount > 0 && (
                  <span className="text-red-400 mr-2">{review.criticalCount} critical</span>
                )}
                {review.warningCount > 0 && (
                  <span className="text-yellow-400 mr-2">{review.warningCount} warnings</span>
                )}
                {review.infoCount > 0 && (
                  <span className="text-blue-400">{review.infoCount} info</span>
                )}
              </td>
              <td className="py-3 px-4 text-gray-400 text-sm">
                {new Date(review.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewHistory;
