'use server';

/**
 * @fileOverview This file defines a Genkit flow for prioritizing maintenance issues based on historical data.
 *
 * - prioritizeMaintenanceIssues - A function that takes maintenance data and returns a prioritized list of issues.
 * - PrioritizeMaintenanceIssuesInput - The input type for the prioritizeMaintenanceIssues function.
 * - PrioritizeMaintenanceIssuesOutput - The return type for the prioritizeMaintenanceIssues function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const PrioritizeMaintenanceIssuesInputSchema = z.object({
  historicalData: z.string().describe('Historical maintenance data for the fleet.'),
});
export type PrioritizeMaintenanceIssuesInput = z.infer<typeof PrioritizeMaintenanceIssuesInputSchema>;

const PrioritizeMaintenanceIssuesOutputSchema = z.object({
  prioritizedIssues: z
    .string()
    .describe('A prioritized list of maintenance issues needing attention first.'),
});
export type PrioritizeMaintenanceIssuesOutput = z.infer<typeof PrioritizeMaintenanceIssuesOutputSchema>;

export async function prioritizeMaintenanceIssues(
  input: PrioritizeMaintenanceIssuesInput
): Promise<PrioritizeMaintenanceIssuesOutput> {
  return prioritizeMaintenanceIssuesFlow(input);
}

const prioritizeMaintenanceIssuesPrompt = ai.definePrompt({
  name: 'prioritizeMaintenanceIssuesPrompt',
  input: {schema: PrioritizeMaintenanceIssuesInputSchema},
  output: {schema: PrioritizeMaintenanceIssuesOutputSchema},
  prompt: `You are an AI assistant helping a fleet manager prioritize maintenance issues.

  Based on the historical maintenance data provided, identify and prioritize the maintenance issues that need attention first.

  Historical Data: {{{historicalData}}}

  Prioritized Issues:`,
});

const prioritizeMaintenanceIssuesFlow = ai.defineFlow(
  {
    name: 'prioritizeMaintenanceIssuesFlow',
    inputSchema: PrioritizeMaintenanceIssuesInputSchema,
    outputSchema: PrioritizeMaintenanceIssuesOutputSchema,
  },
  async input => {
    const {output} = await prioritizeMaintenanceIssuesPrompt(input);
    return output!;
  }
);
