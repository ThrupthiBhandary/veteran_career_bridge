
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
  veteranAge: z.number().optional().describe("The veteran's age."),
  maxAgeRequirement: z.number().optional().describe("The job's maximum age requirement, if any."),
  veteranHighestQualification: z.string().optional().describe("The veteran's highest qualification."),
});
export type SkillMatchingInput = z.infer<typeof SkillMatchingInputSchema>;

const SkillMatchingOutputSchema = z.object({
  matchScore: z
    .number()
    .describe(
      'A numerical score (0-100) indicating the degree of match between the veteran profile (skills, preferences, age, qualifications) and the job requirements.'
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
      "A summary of how well the veteran aligns with the job, considering skills, preferences for industry/title, age suitability against job's age requirement, qualifications, potential skill gaps, and areas of strength."
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

You will receive a list of skills possessed by the veteran, their preferred industries and job titles (if provided), their age, their highest qualification, and a job description which may include a maximum age requirement.

Your task is to:
1. Calculate a match score (0-100). This score should primarily be based on the alignment between the veteran's skills ({{{veteranSkills}}}) and the job requirements. 
   Also consider:
   - If the job's industry and title align with the veteran's stated preferences ({{{desiredIndustry}}}, {{{desiredJobTitle}}}), and let this moderately influence the score.
   - The veteran's age ({{{veteranAge}}}) in relation to the job's maximum age requirement ({{{maxAgeRequirement}}}). If a maxAgeRequirement is specified and the veteran is older, significantly reduce the match score. If no maxAgeRequirement is specified, or if the veteran's age is within the limit, age should not negatively impact the score.
   - The veteran's highest qualification ({{{veteranHighestQualification}}}) and how it relates to the job description.
2. Identify which skills from the veteran's profile are most relevant to the job opening.
3. Identify any skills required for the job that are NOT present in the veteran's profile.
4. Provide a summary of how well the veteran aligns with the job. This summary should cover skill alignment, potential skill gaps, areas of strength, explicitly state how the job's industry and role compare to the veteran's preferences, and how the veteran's age and qualification align with the job. Specifically mention if age is a concern due to a maximum age requirement.

Veteran Skills: {{{veteranSkills}}}
Veteran Desired Industries: {{#if desiredIndustry}}{{#each desiredIndustry}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
Veteran Desired Job Titles: {{#if desiredJobTitle}}{{#each desiredJobTitle}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
Veteran Age: {{#if veteranAge}}{{{veteranAge}}}{{else}}Not specified{{/if}}
Veteran Highest Qualification: {{#if veteranHighestQualification}}{{{veteranHighestQualification}}}{{else}}Not specified{{/if}}
Job Description: {{{jobDescription}}}
Job Maximum Age Requirement: {{#if maxAgeRequirement}}{{{maxAgeRequirement}}}{{else}}Not specified{{/if}}

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

