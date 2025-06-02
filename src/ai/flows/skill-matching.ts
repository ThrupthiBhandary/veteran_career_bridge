'use server';
/**
 * @fileOverview An AI agent that matches veteran skills to civilian job opportunities.
 *
 * - skillMatching - A function that handles the skill matching process.
 * - SkillMatchingInput - The input type for the skillMatching function.
 * - SkillMatchingOutput - The return type for the skillMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillMatchingInputSchema = z.object({
  veteranSkills: z
    .array(z.string())
    .describe('A list of skills possessed by the veteran.'),
  jobDescription: z.string().describe('The description of the job opening.'),
});
export type SkillMatchingInput = z.infer<typeof SkillMatchingInputSchema>;

const SkillMatchingOutputSchema = z.object({
  matchScore: z
    .number()
    .describe(
      'A numerical score indicating the degree of match between the veteran skills and the job requirements.'
    ),
  relevantSkills: z
    .array(z.string())
    .describe(
      'A list of skills from the veteran profile that are relevant to the job opening.'
    ),
  missingSkills: z
    .array(z.string())
    .describe(
      'A list of skills required for the job but not found in the veteran profile.'
    ),
  overallFit: z
    .string()
    .describe(
      'A summary of how well the veteran skills align with the job requirements, including potential skill gaps and areas of strength.'
    ),
});
export type SkillMatchingOutput = z.infer<typeof SkillMatchingOutputSchema>;

export async function skillMatching(input: SkillMatchingInput): Promise<SkillMatchingOutput> {
  return skillMatchingFlow(input);
}

const skillMatchingPrompt = ai.definePrompt({
  name: 'skillMatchingPrompt',
  input: {schema: SkillMatchingInputSchema},
  output: {schema: SkillMatchingOutputSchema},
  prompt: `You are an AI-powered career advisor, specializing in helping military veterans translate their skills to civilian job opportunities.

You will receive a list of skills possessed by the veteran and a job description.

Your task is to:
1. Calculate a match score (0-100) indicating the degree of match between the veteran's skills and the job requirements.
2. Identify which skills from the veteran's profile are most relevant to the job opening.
3. Identify any skills required for the job that are NOT present in the veteran's profile.
4. Provide a summary of how well the veteran's skills align with the job requirements, including potential skill gaps and areas of strength.

Veteran Skills: {{{veteranSkills}}}
Job Description: {{{jobDescription}}}

Output:
Match Score: 
Relevant Skills: 
Missing Skills: 
Overall Fit: `,
});

const skillMatchingFlow = ai.defineFlow(
  {
    name: 'skillMatchingFlow',
    inputSchema: SkillMatchingInputSchema,
    outputSchema: SkillMatchingOutputSchema,
  },
  async input => {
    const {output} = await skillMatchingPrompt(input);
    return output!;
  }
);
