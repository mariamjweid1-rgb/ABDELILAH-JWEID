export enum AppSection {
  IMAGE_STUDIO = 'imageStudio',
  PRODUCT_FUSION = 'productFusion',
  ANALYSIS = 'analysis',
  BRAIN_AI = 'brainAI',
  ROTATION_LAB = 'rotationLab',
  OUTFIT_CHANGER = 'outfitChanger',
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface AnalysisResult {
  title: string;
  details: string[];
  suggestions: string[];
}

export interface PromptIdea {
  title: string;
  prompt: string;
}