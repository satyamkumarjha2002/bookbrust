import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto">
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Welcome to BookBrust</CardTitle>
          <CardDescription>Your book management platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This project has been cleaned up and is ready for new development.</p>
          <p>The sidebar and navigation elements have been simplified and all school management related features removed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
