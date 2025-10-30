// 自适应提示词工程系统 - AI服务接口
import { Message, IntentType, TargetModel, AdaptivePromptResult } from '../types';
import { processAdaptiveConversation } from './siliconflowService';

// 自适应对话处理接口
export interface AdaptiveProcessConversationParams {
  messages: Message[];
  model?: string;
  temperature?: number;
  targetModel?: TargetModel;
  intent?: IntentType;
}

// 处理对话的自适应接口
export const processConversation = async ({
  messages,
  model = 'deepseek-ai/DeepSeek-V3',
  temperature = 0.7,
  targetModel = TargetModel.GPT,
  intent
}: AdaptiveProcessConversationParams): Promise<AdaptivePromptResult> => {
  try {
    // 使用自适应提示词工程系统
    return await processAdaptiveConversation({ 
      messages, 
      model, 
      temperature, 
      targetModel, 
      intent 
    });
  } catch (error) {
    console.error('自适应对话处理错误:', error);
    throw error;
  }
};

// 获取支持的模型列表
export const getSupportedModels = () => {
  return [
    {
      id: 'deepseek-ai/DeepSeek-V3.1-Terminus',
      name: 'DeepSeek-V3.1-Terminus',
      description: 'DeepSeek V3.1 Terminus模型，推理能力强大'
    },
    {
      id: 'deepseek-ai/DeepSeek-V3.2-Exp',
      name: 'DeepSeek-V3.2-Exp',
      description: 'DeepSeek V3.2 Exp模型，实验版本'
    },
    {
      id: 'Qwen/Qwen3-VL-235B-A22B-Thinking',
      name: 'Qwen3-VL-235B-A22B-Thinking',
      description: '通义千问多模态模型，支持视觉语言任务'
    },
    {
      id: 'zai-org/GLM-4.6',
      name: 'GLM-4.6',
      description: '智谱AI GLM-4.6模型，综合性能优秀'
    }
  ];
};

// 验证API密钥
export const validateApiKey = async (apiKey: string) => {
  // 简单的API密钥验证逻辑
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API密钥不能为空');
  }
  return true;
};