import { z } from "zod"
import { baseConfig, BaseActions, ModuleReplayAbility, ModuleResultType, ModuleIntegrationType } from 'wolfy-module-kit';
import { AppActionsSchema } from "./actions";

// region Generated
const moduleConfiguration = z.object({
  resultAction: AppActionsSchema,
  gameTitle: z.string().min(1),
  roomId: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  hintsEnabled: z.boolean(),
  maxHints: z.number().min(0).max(10),
  timerEnabled: z.boolean(),
  timeLimit: z.number().min(60).max(1800), // seconds
  colorScheme: z.enum(['classic', 'neon', 'monochrome']),
  narrativeComplexity: z.enum(['simple', 'detailed', 'complex']),
  soundEnabled: z.boolean(),
  particleEffects: z.boolean(),
});

/**
 * Form state interface for configuration form
 */
export interface ConfigFormData extends ModuleConfig {
  resultAction: BaseActions.Done;
  gameTitle: string;
  roomId: string;
  difficulty: "easy" | "medium" | "hard";
  hintsEnabled: boolean;
  maxHints: number;
  timerEnabled: boolean;
  timeLimit: number;
  colorScheme: "classic" | "neon" | "monochrome";
  narrativeComplexity: "simple" | "detailed" | "complex";
  soundEnabled: boolean;
  particleEffects: boolean;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: ConfigFormData = {
  replayAbility: ModuleReplayAbility.Once,
  expectedResultType: ModuleResultType.Attempt,
  integrationType: ModuleIntegrationType.Standalone,
  resultAction: BaseActions.Done,
  gameTitle: "Digital Detective",
  roomId: "detective_apartment",
  difficulty: "medium" as const,
  hintsEnabled: true,
  maxHints: 3,
  timerEnabled: false,
  timeLimit: 600,
  colorScheme: "neon" as const,
  narrativeComplexity: "detailed" as const,
  soundEnabled: true,
  particleEffects: true
}
// endregion Generated

const fullConfig = baseConfig.merge(moduleConfiguration);
export default fullConfig;

export type ModuleConfig = z.infer<typeof fullConfig>;

export const conditionalConfig = fullConfig.partial();
export type ConditionalConfigType = z.infer<typeof conditionalConfig>;
