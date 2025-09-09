import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="flex items-center justify-center h-screen w-screen">
      <Card className="bg-background lg:w-1/3 md:w-1/2 sm:w-full w-full lg:h-fit h-min-fit md:h-3/4">
        <CardHeader>
          <CardTitle>Welcome to Note</CardTitle>
          <CardDescription>Please log in to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Label>Email</Label>
          <Input placeholder="Email" />
          <Label>Password</Label>
          <Input placeholder="Password" />
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center">
          <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
            <Link href="/dashboard/notes">Log in</Link>
          </Button>
          <div className="border-t border-solid border-neutral-300 w-full my-4" />
          <p className="text-sm text-neutral-500">Or log in with:</p>
          <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
            Google
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
