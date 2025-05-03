import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Clock, BookOpen, Calendar, TrendingUp, Award } from 'lucide-react';
import { ReadingInsight } from '@/types/reading-features';
import { insightService } from '@/lib/services/readingFeaturesService';
import { formatDuration } from '@/lib/utils';

export function ReadingInsights() {
  const [insights, setInsights] = useState<ReadingInsight | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    loadInsights();
  }, []);
  
  const loadInsights = () => {
    try {
      const data = insightService.getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading reading insights:', error);
    }
  };
  
  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Reading Insights
          </CardTitle>
          <CardDescription>
            Start tracking your reading to see insights
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            You don't have any reading data yet. Use the reading timer to track your reading sessions.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="h-5 w-5 mr-2" />
          Reading Insights
        </CardTitle>
        <CardDescription>
          Statistics and insights about your reading habits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="time">Time Stats</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <div className="flex items-center mb-2 text-primary">
                  <Clock className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Total Reading Time</h3>
                </div>
                <p className="text-2xl font-semibold">
                  {formatDuration(insights.totalReadingTime)}
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex items-center mb-2 text-primary">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Reading Streak</h3>
                </div>
                <p className="text-2xl font-semibold">
                  {insights.readingStreak} day{insights.readingStreak !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="flex items-center mb-3 text-primary">
                <Award className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Reading Patterns</h3>
              </div>
              
              <div className="space-y-2">
                {insights.mostProductiveTimeOfDay && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Most productive time:</span>
                    <span className="font-medium capitalize">
                      {insights.mostProductiveTimeOfDay}
                    </span>
                  </div>
                )}
                
                {insights.readingSpeed !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average reading speed:</span>
                    <span className="font-medium">
                      {Math.round(insights.readingSpeed)} pages/hour
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average session length:</span>
                  <span className="font-medium">
                    {formatDuration(insights.averageSessionLength)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="time" className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="flex items-center mb-3 text-primary">
                <Clock className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Time Statistics</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total reading time:</span>
                  <span className="font-medium">
                    {formatDuration(insights.totalReadingTime)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average session length:</span>
                  <span className="font-medium">
                    {formatDuration(insights.averageSessionLength)}
                  </span>
                </div>
                
                {insights.mostProductiveTimeOfDay && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Most productive time:</span>
                    <span className="font-medium capitalize">
                      {insights.mostProductiveTimeOfDay}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Pro tip: Research suggests reading in 25-45 minute focused sessions 
                  can improve comprehension and retention.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="streaks" className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="flex items-center mb-3 text-primary">
                <Calendar className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Reading Streaks</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current streak:</span>
                  <span className="font-medium">
                    {insights.readingStreak} day{insights.readingStreak !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Consistent daily reading, even just for 15-20 minutes, 
                  can significantly improve your reading habits and comprehension.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 