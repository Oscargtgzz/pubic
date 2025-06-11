
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { KpiCardData } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react"; // Import all lucide-react icons

interface KpiCardProps {
  data: KpiCardData;
}

export function KpiCard({ data }: KpiCardProps) {
  // Dynamically get the IconComponent based on iconName
  const IconComponent = data.iconName && LucideIcons[data.iconName as keyof typeof LucideIcons] 
    ? LucideIcons[data.iconName as keyof typeof LucideIcons] 
    : null;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {data.title}
        </CardTitle>
        {IconComponent && <IconComponent className={cn("h-5 w-5 text-muted-foreground", data.colorClass)} />}
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", data.colorClass)}>{data.value}</div>
        {data.description && (
          <p className="text-xs text-muted-foreground pt-1">
            {data.description}
          </p>
        )}
        {data.actionLink && data.actionText && (
          <Button variant="link" asChild className="px-0 pt-2 text-sm text-primary hover:text-primary/80">
            <Link href={data.actionLink}>
              {data.actionText}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
