import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

import { Blog } from '../../data/blogs';
import { BlogCard } from './BlogCard';
import { getAllBlogs } from '../../lib/blogContent';
import {
  toBikramSambat,
  fromBikramSambat,
  getDaysInADMonth,
  getBikramMonthInfo
} from '../../lib/utils/lib';

interface BlogWidgetProps {
  activeSystem: 'bs' | 'ad';
  currentYear: number;
  currentMonth: number;
  onBlogClick: (blog: Blog) => void;
  onViewAll?: () => void;
  enableLoadMore?: boolean;
  initialCount?: number;
  filterTag?: string;
  onClearFilter?: () => void;
  onTagClick?: (tag: string) => void;
}

export const BlogWidget: React.FC<BlogWidgetProps> = ({
  activeSystem,
  currentYear,
  currentMonth,
  onBlogClick,
  onViewAll,
  enableLoadMore = false,
  initialCount = 12,
  filterTag,
  onClearFilter,
  onTagClick
}) => {
  // State for pagination
  const [visibleCount, setVisibleCount] = React.useState(initialCount);
  const allContent: Blog[] = React.useMemo(() => getAllBlogs(), []);

  // CALCULATE VIEW DATE RANGE (AD)
  const { startAd, endAd } = React.useMemo(() => {
    let start: Date, end: Date;

    if (activeSystem === 'bs') {
      // BS View: Whole BS Month
      start = fromBikramSambat(currentYear, currentMonth, 1);
      const { totalDays } = getBikramMonthInfo(currentYear, currentMonth);
      end = fromBikramSambat(currentYear, currentMonth, totalDays);
    } else {
      // AD View: Whole AD Month
      start = new Date(currentYear, currentMonth, 1);
      const daysInMonth = getDaysInADMonth(currentYear, currentMonth + 1);
      end = new Date(currentYear, currentMonth, daysInMonth);
    }
    // Set times to boundary to ensure inclusive comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { startAd: start, endAd: end };
  }, [activeSystem, currentYear, currentMonth]);

  // FILTERING HELPER
  const getItemsForCurrentView = () => {
    return allContent.filter(item => {
      // Strict Date Matching
      if (item.eventDate) {
        const { month, day } = item.eventDate;
        if (!day) return false; // Skip if no specific day

        // Construct a concrete AD date for this event in the current view's context
        // We try both current view start year and end year (to handle overlap)
        // Actually, easiest way: Convert the Event (BS) -> AD for the relevant year(s)

        // Strategy: Convert View Range to BS Range?
        // Or simpler: Convert Event to AD. We know the current BS year derived from view.
        // Let's get the BS year from the View Start date.

        const viewStartBs = toBikramSambat(startAd);
        const viewEndBs = toBikramSambat(endAd);

        // We check the event against the view range using date objects
        // Create candidate dates for the event in the years covered by the view
        const yearsToCheck = new Set([viewStartBs.year, viewEndBs.year]);

        for (const year of yearsToCheck) {
          try {
            // month is 1-12 in data, needs 0-11 for conversion
            const eventAd = fromBikramSambat(year, month - 1, day);
            eventAd.setHours(12, 0, 0, 0); // Noon to avoid timezone edge cases

            if (eventAd >= startAd && eventAd <= endAd) {
              return true;
            }
          } catch (e) {
            // Invalid date (e.g. day doesn't exist in that year's month)
            continue;
          }
        }
        return false;
      }
      return false;
    });
  };

  // FILTER & SORT
  let currentViewItems = getItemsForCurrentView();

  // Sort by date (closest to start of month)
  currentViewItems.sort((a, b) => {
    // Helper to get AD timestamp for sorting
    const getTimestamp = (blog: Blog) => {
      if (!blog.eventDate?.day) return 0;
      const viewStartBs = toBikramSambat(startAd);
      // Approximate using start year
      return fromBikramSambat(viewStartBs.year, blog.eventDate.month - 1, blog.eventDate.day).getTime();
    };
    return getTimestamp(a) - getTimestamp(b);
  });


  // C. GENERAL (Items with no eventDate and no specific month tags)
  // We keep General items to fill space
  const allMonthTags = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  let generalItems = allContent.filter(item => {
    if (item.eventDate) return false; // Has date, handled above
    if (item.tags && item.tags.some(t => allMonthTags.includes(t))) return false; // Has month tag
    return true;
  });

  // Shuffle general items (Daily Rotation)
  const todayStr = new Date().toISOString().split('T')[0];
  let seed = 0;
  for (let i = 0; i < todayStr.length; i++) {
    seed = ((seed << 5) - seed) + todayStr.charCodeAt(i);
    seed |= 0;
  }
  const seededRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  for (let i = generalItems.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [generalItems[i], generalItems[j]] = [generalItems[j], generalItems[i]];
  }

  // COMBINE
  let displayBlogs = [...currentViewItems];

  const generalUnique = generalItems.filter(b => !displayBlogs.some(existing => existing.id === b.id));
  displayBlogs = [...displayBlogs, ...generalUnique];

  // FILTER BY TAG IF PRESENT
  if (filterTag) {
    displayBlogs = displayBlogs.filter(blog => blog.tags && blog.tags.some(t => t.toLowerCase() === filterTag.toLowerCase()));
  }

  // Final Slice
  const totalItems = displayBlogs.length;
  const slicedBlogs = displayBlogs.slice(0, visibleCount);

  if (slicedBlogs.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {filterTag ? (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                विषय: {filterTag}
              </span>
              <button onClick={onClearFilter} className="text-blue-500 hover:text-blue-700 dark:text-blue-400">
                ✕
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-none">
                  धर्म र संस्कृति
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 block">
                  चाडपर्व, रीतिथिति र जानकारीहरू
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {slicedBlogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            onClick={onBlogClick}
            onTagClick={onTagClick}
          />
        ))}
      </div>

      {/* Fallback/Empty State Filler (Optional - if we want to ensure footer gap is filled) */}
      {/* For now, the grid of 3 cards usually fills significant space. */}

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 border border-indigo-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-amber-500 w-5 h-5 animate-pulse" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {enableLoadMore
              ? (totalItems > visibleCount ? "अझै थप लेखहरू पढ्नुहोस्" : "सबै लेखहरू देखाइएको छ")
              : "थप धार्मिक जानकारी र लेखहरूको लागि"}
          </span>
        </div>

        {enableLoadMore ? (
          totalItems > visibleCount && (
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-6 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 text-sm font-bold rounded-full shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              थप लोड गर्नुहोस् (Load More)
            </button>
          )
        ) : (
          onViewAll && (
            <button
              onClick={onViewAll}
              className="px-6 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 text-sm font-bold rounded-full shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              धर्म र संस्कृति हेर्नुहोस्
            </button>
          )
        )}
      </div>
    </div>
  );
};
