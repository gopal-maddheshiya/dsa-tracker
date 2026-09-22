import React, { useState, useEffect } from 'react';
import { fetchProblemRecommendations } from '../../api/problems';
import TodaysFocusCard from './TodaysFocusCard';
import UpcomingRevisionsCard from './UpcomingRevisionsCard';

/**
 * PracticeStudio: Composite component combining Today's Focus (Hero)
 * and Upcoming Revisions (Supporting Priority).
 */
const PracticeStudio = ({
  queue = [],
  isLoadingQueue = false,
  queueError = null,
  onRetryQueue,
  className = '',
}) => {
  const [data, setData] = useState(null);
  const [loadingRecommender, setLoadingRecommender] = useState(true);

  const loadRecommendations = async () => {
    try {
      setLoadingRecommender(true);
      const res = await fetchProblemRecommendations();
      if (res?.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoadingRecommender(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const dailyFocus = data?.dailyFocus;
  const weakestTopics = data?.weakestTopics || [];
  const primaryWeakTopic = weakestTopics.length > 0 ? weakestTopics[0] : null;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch ${className}`}>
      <div className="lg:col-span-8 flex flex-col h-full">
        <TodaysFocusCard
          dailyFocus={dailyFocus}
          primaryWeakTopic={primaryWeakTopic}
          isLoading={loadingRecommender}
        />
      </div>
      <div className="lg:col-span-4 flex flex-col h-full">
        <UpcomingRevisionsCard
          queue={queue}
          featuredId={dailyFocus?.id}
          isLoading={isLoadingQueue}
          error={queueError}
          onRetry={onRetryQueue}
        />
      </div>
    </div>
  );
};

export default PracticeStudio;
