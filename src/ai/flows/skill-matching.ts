
'use server';
/**
 * @fileOverview An AI agent that matches veteran skills and preferences to civilian job opportunities.
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
  desiredIndustry: z
    .array(z.string())
    .optional()
    .describe("The veteran's desired industries for work."),
  desiredJobTitle: z
    .array(z.string())
    .optional()
    .describe("The veteran's desired job titles."),
});
export type SkillMatchingInput = z.infer<typeof SkillMatchingInputSchema>;

const SkillMatchingOutputSchema = z.object({
  matchScore: z
    .number()
    .describe(
      'A numerical score (0-100) indicating the degree of match between the veteran skills/preferences and the job requirements.'
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
      "A summary of how well the veteran aligns with the job, considering skills, preferences for industry/title, potential skill gaps, and areas of strength."
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
  prompt: `You are an AI-powered career advisor, specializing in helping military veterans translate their skills and preferences to civilian job opportunities.

You will receive a list of skills possessed by the veteran, their preferred industries and job titles (if provided), and a job description.

Your task is to:
1. Calculate a match score (0-100) indicating the degree of match. This score should primarily be based on the alignment between the veteran's skills and the job requirements. However, also consider if the job's industry and title align with the veteran's stated preferences ({{{desiredIndustry}}}, {{{desiredJobTitle}}}), and let this moderately influence the score.
2. Identify which skills from the veteran's profile ({{{veteranSkills}}}) are most relevant to the job opening.
3. Identify any skills required for the job that are NOT present in the veteran's profile.
4. Provide a summary of how well the veteran aligns with the job. This summary should cover skill alignment, potential skill gaps, areas of strength, and explicitly state how the job's industry and role compare to the veteran's preferences for desired industry and job titles.

Veteran Skills: {{{veteranSkills}}}
Veteran Desired Industries: {{#if desiredIndustry}}{{#each desiredIndustry}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
Veteran Desired Job Titles: {{#if desiredJobTitle}}{{#each desiredJobTitle}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
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
    const {output} = await skillMatchingPrompt({
        ...input,
        veteranSkills: input.veteranSkills || [],
        desiredIndustry: input.desiredIndustry || [],
        desiredJobTitle: input.desiredJobTitle || [],
    });
    return output!;
  }
);

