import { AppActionsSchema } from "@/system/actions"
import { ModuleResultType } from 'wolfy-module-kit'
import { type FormFieldConfig } from '@/components/ConfigForm/ConfigForm'

export const FORM_FIELDS: FormFieldConfig[] = [
  {
    key: "gameTitle",
    label: "Game Title",
    type: "text",
    placeholder: "Enter the investigation title",
    required: true,
  },
  {
    key: "roomId",
    label: "Investigation Scene",
    type: "select",
    options: ["detective_apartment", "corporate_office", "crime_scene"],
    required: true,
  },
  {
    key: "difficulty",
    label: "Difficulty Level",
    type: "select",
    options: ["easy", "medium", "hard"],
    required: true,
  },
  {
    key: "hintsEnabled",
    label: "Enable Hints",
    type: "select",
    options: ["true", "false"],
    required: true,
  },
  {
    key: "maxHints",
    label: "Maximum Hints",
    type: "number",
    min: 0,
    max: 10,
    required: false,
  },
  {
    key: "timerEnabled",
    label: "Enable Timer",
    type: "select",
    options: ["true", "false"],
    required: true,
  },
  {
    key: "timeLimit",
    label: "Time Limit (seconds)",
    type: "number",
    min: 60,
    max: 1800,
    required: false,
  },
  {
    key: "colorScheme",
    label: "Visual Theme",
    type: "select",
    options: ["classic", "neon", "monochrome"],
    required: true,
  },
  {
    key: "narrativeComplexity",
    label: "Story Complexity",
    type: "select",
    options: ["simple", "detailed", "complex"],
    required: true,
  },
  {
    key: "soundEnabled",
    label: "Enable Sound Effects",
    type: "select",
    options: ["true", "false"],
    required: true,
  },
  {
    key: "particleEffects",
    label: "Enable Visual Effects",
    type: "select",
    options: ["true", "false"],
    required: true,
  },
  {
    key: "resultAction",
    label: "Module Result Action",
    type: "select",
    options: [AppActionsSchema.enum.Done, AppActionsSchema.enum.CaseSolved],
    required: true,
  },
  {
    key: 'expectedResultType',
    label: 'Expected Result Type',
    type: 'select',
    options: Object.values(ModuleResultType) as string[],
    required: true,
  },
]