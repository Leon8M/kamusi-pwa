'use client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { Book, Clock, PlayIcon, Sparkle, TrendingUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';

function Courseinfo({ course, viewCourse }) {
  const courseLayout = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Calculate total duration by summing individual chapter durations
  const calculateTotalDuration = () => {
    let totalMinutes = 0;
    if (courseLayout?.chapters && Array.isArray(courseLayout.chapters)) {
      courseLayout.chapters.forEach(chapter => {
        const durationStr = chapter.duration ? String(chapter.duration).toLowerCase() : ''; // Ensure string and lowercase
        if (durationStr) {
          let chapterMinutes = 0;

          // Case 1: "X hours" or "X hr" (including decimals like "1.5 hours")
          const hoursMatch = durationStr.match(/(\d+(\.\d+)?)\s*(hr|hour|hours)/);
          if (hoursMatch) {
            const hours = parseFloat(hoursMatch[1]);
            chapterMinutes += hours * 60;
          }

          // Case 2: "X min" or "X minutes"
          const minutesMatch = durationStr.match(/(\d+)\s*(min|minute|minutes)/);
          if (minutesMatch) {
            const minutes = parseInt(minutesMatch[1], 10);
            chapterMinutes += minutes;
          }
          
          // Fallback: If only a number is provided without units, assume minutes (e.g., "60" for 60 minutes)
          // Only apply this if no hours or minutes units were explicitly found and parsed
          if (chapterMinutes === 0 && !hoursMatch && !minutesMatch) {
              const numberOnlyMatch = durationStr.match(/^(\d+)$/);
              if (numberOnlyMatch) {
                  chapterMinutes = parseInt(numberOnlyMatch[1], 10);
              }
          }
          
          totalMinutes += chapterMinutes;
        }
      });
    }

    if (totalMinutes === 0) return 'N/A';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} hr ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} hr`;
    } else {
      return `${minutes} min`;
    }
  };

  const GenerateContent = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/generate-course', {
        course: courseLayout,
        courseName: course?.name,
        courseId: course?.cid,
      });
      setLoading(false);
      toast.success('Content generated successfully!');
      router.replace(`/workspace`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden p-6">
      {course?.bannerImageUrl && (
        <div className="md:w-1/2 w-full relative h-64 rounded-lg overflow-hidden bg-[var(--muted)] flex items-center justify-center">
          <Image
            src={course?.bannerImageUrl}
            alt={course?.name || 'Course banner'}
            width={800}
            height={300}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/800x300/cccccc/333333?text=No+Image";
              e.target.alt = "Image not available";
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-4 md:w-1/2 w-full justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--foreground)]">{courseLayout?.name || "Untitled Course"}</h1>
          <p className="text-[var(--muted-foreground)] mt-2">{courseLayout?.description || "No description available."}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--foreground)] mt-4">
          <div className="flex items-center gap-3 bg-[var(--accent)] p-3 rounded-lg shadow-sm">
            <Clock className="text-[var(--primary)] w-5 h-5" />
            <div>
              <p className="font-medium text-[var(--foreground)]">Duration</p>
              <p className="text-[var(--muted-foreground)]">{calculateTotalDuration()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[var(--accent)] p-3 rounded-lg shadow-sm">
            <Book className="text-[var(--primary)] w-5 h-5" />
            <div>
              <p className="font-medium text-[var(--foreground)]">Chapters</p>
              <p className="text-[var(--muted-foreground)]">{courseLayout?.chapters?.length || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[var(--accent)] p-3 rounded-lg shadow-sm col-span-1 sm:col-span-2">
            <TrendingUp className="text-[var(--primary)] w-5 h-5" />
            <div>
              <p className="font-medium text-[var(--foreground)]">Difficulty</p>
              <p className="text-[var(--muted-foreground)] capitalize">{courseLayout?.difficulty || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {!viewCourse ? (
            <Button disabled={loading} onClick={GenerateContent} className="btn-primary w-full md:w-auto !h-12 !text-base">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkle className="w-5 h-5 mr-2" />
                  Generate Course Content
                </>
              )}
            </Button>
          ) : (
            <Link href={`/course/${course?.cid}`}>
              <Button className="btn-primary w-full md:w-auto !h-12 !text-base">
                <PlayIcon className="w-5 h-5 mr-2" />
                Continue Course
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courseinfo;
