// This is an autogenerated file from Firebase Studio.
'use server';
/**
 * @fileOverview Uses AI to analyze maintenance data and predict potential issues.
 *
 * - predictMaintenanceNeeds - A function that handles the maintenance prediction process.
 * - PredictMaintenanceNeedsInput - The input type for the predictMaintenanceNeeds function.
 * - PredictMaintenanceNeedsOutput - The return type for the predictMaintenanceNeeds function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const PredictMaintenanceNeedsInputSchema = z.object({
  vehicleId: z.string().describe('The ID of the vehicle to predict maintenance needs for.'),
  maintenanceHistory: z.string().describe('Historical maintenance data for the vehicle.'),
});
export type PredictMaintenanceNeedsInput = z.infer<typeof PredictMaintenanceNeedsInputSchema>;

const PredictMaintenanceNeedsOutputSchema = z.object({
  predictedIssues: z.string().describe('A description of the potential maintenance issues.'),
  priority: z.string().describe('The priority of the predicted issues (e.g., high, medium, low).'),
  recommendedActions: z.string().describe('Recommended actions to address the predicted issues.'),
});
export type PredictMaintenanceNeedsOutput = z.infer<typeof PredictMaintenanceNeedsOutputSchema>;

export async function predictMaintenanceNeeds(input: PredictMaintenanceNeedsInput): Promise<PredictMaintenanceNeedsOutput> {
  return predictMaintenanceNeedsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictMaintenanceNeedsPrompt',
  input: {schema: PredictMaintenanceNeedsInputSchema},
  output: {schema: PredictMaintenanceNeedsOutputSchema},
  prompt: `You are an AI assistant that analyzes vehicle maintenance history and predicts potential issues.
  Based on the provided maintenance history for the vehicle, predict potential issues, their priority, and recommend actions.

  Vehicle ID: {{{vehicleId}}}
  Maintenance History: {{{maintenanceHistory}}}

  Respond in a structured format with predicted issues, priority, and recommended actions.
  `,
});

const predictMaintenanceNeedsFlow = ai.defineFlow(
  {
    name: 'predictMaintenanceNeedsFlow',
    inputSchema: PredictMaintenanceNeedsInputSchema,
    outputSchema: PredictMaintenanceNeedsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
