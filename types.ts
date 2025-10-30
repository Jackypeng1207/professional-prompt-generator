export interface FileContent {
  name: string;
  type: 'image' | 'document';
  data: string; // base64 for image, raw text for document
  mimeType: string;
}

export type MessageContent = string | (string | FileContent)[];

export interface Message {
  role: 'user' | 'assistant';
  content: MessageContent;
}

export interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
  timestamp: number;
}

// 自适应提示词工程系统 - 意图分类
export enum IntentType {
  GENERAL = '通用写作',
  STRUCTURED_DATA = '结构化数据',
  SOFTWARE_PROGRAMMING = '软件编程',
  IMAGE_GENERATION = '图像生成',
  COMPLEX_REASONING = '复杂推理',
  OTHER = '其他'
}

// 目标AI模型类型
export enum TargetModel {
  GPT = 'GPT系列',
  CLAUDE = 'Claude系列',
  MIDJOURNEY = 'Midjourney',
  STABLE_DIFFUSION = 'Stable Diffusion',
  LLAMA = 'LLaMA',
  DEEPSEEK = 'DeepSeek系列',
  OTHER = '其他'
}

// 高级提示词技术
export enum PromptTechnique {
  CHAIN_OF_THOUGHT = '思维链(CoT)',
  REACT = 'ReAct',
  FEW_SHOT = 'Few-shot',
  ZERO_SHOT = 'Zero-shot',
  SELF_REFINE = '自我优化'
}

// 自适应提示词生成结果
export interface AdaptivePromptResult {
  prompt: string; // 完整的优化提示词
  intent: IntentType; // 意图分类
  targetModel: TargetModel; // 目标AI模型
  techniques: PromptTechnique[]; // 使用的技术
  templateUsed: string; // 使用的模板名称
  explanation: string; // 专业解析
  suggestions: string[]; // 下一步建议
  conversationHistory: Message[]; // 对话历史
  conversationSummary: string; // 对话摘要
  needsClarification: boolean; // 是否需要进一步澄清需求
  clarificationQuestion: string; // 澄清问题
}
