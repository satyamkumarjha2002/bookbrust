import React from 'react';
import { PieChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const LearningOutcomes = () => {
  return (
    <div className="p-4">
      <Card className="w-full shadow-sm">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <div className="bg-cyan-100 p-5 rounded-full mb-4">
            <PieChart className="h-10 w-10 text-cyan-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Learning Outcomes</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Define, track, and analyze learning outcomes aligned with curriculum standards.
          </p>
          <Button>Coming Soon</Button>
        </CardContent>
      </Card>
    </div>
  );
}; 