import { config } from 'dotenv';
config();

import '@/ai/flows/prioritize-maintenance-issues.ts';
import '@/ai/flows/predict-maintenance-needs.ts';