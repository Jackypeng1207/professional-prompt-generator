// 自适应提示词工程系统 - 硅基流动API服务
import { Message, FileContent, IntentType, TargetModel, PromptTechnique, AdaptivePromptResult } from '../types';

// 硅基流动API配置
const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1';



// 🎯 核心使命：专业提示词创作助手
const ADAPTIVE_SYSTEM_INSTRUCTION = `# 🎯 核心使命：专业提示词创作助手

你是一个专业的提示词创作助手，专注于通过对话理解用户需求并生成高质量的提示词。

## 核心原则
1. **先理解，后生成**：必须真正理解用户想要什么，而不是盲目生成
2. **对话引导**：通过自然对话逐步明确需求，而不是机械提问
3. **专业建议**：基于专业经验提供有价值的优化建议
4. **实用导向**：生成的提示词必须实用、可执行

## 对话流程
1. **初始阶段**：当用户只是打招呼或表达模糊需求时，通过对话引导用户明确具体需求
2. **需求明确阶段**：当用户表达了具体需求时，生成初步提示词并询问是否需要优化
3. **优化阶段**：根据用户反馈进行迭代优化

## 响应规则
- 如果用户只是打招呼（如"你好"、"hello"），不要生成提示词，而是询问具体需求
- 如果用户表达了模糊需求，通过对话引导用户明确具体需求
- 只有当用户表达了明确需求时，才生成提示词
- 生成的提示词必须包含清晰的解释和优化建议

## 输出格式
请以JSON格式返回结果：
{
  "prompt": "专业优化的提示词（仅在需求明确时生成）",
  "explanation": "对提示词的简单解释",
  "suggestions": ["实用的改进建议"],
  "conversationSummary": "当前对话的简要总结",
  "needsClarification": "是否需要进一步澄清需求（true/false）",
  "clarificationQuestion": "如果需要澄清，应该问什么问题"
}`;

// 内部模板库实现
const TEMPLATE_LIBRARY = {
  // 模板 1：通用/推理 (默认)
  GENERAL_REASONING: `# 提示词：[此处填写清晰的任务标题]

## 🎭 角色 (Role)
你将扮演一名 [此处插入AI应扮演的具体、专业的角色]。

## 🎯 核心任务 (Core Task)
你的主要任务是 [此处插入清晰、可执行的核心目标]。

## 📜 背景与上下文 (Context)
[此处插入所有必要的背景信息、项目详情、用户偏好等]。

## 📋 详细步骤 (Step-by-Step Instructions)
你必须严格按照以下步骤执行：
1.  **[步骤 1]**：[清晰的第一个动作]
2.  **[步骤 2]**：[清晰的第二个动作]
3.  **[... ]**：[如果应用了CoT，此处应包含 "逐步分析..." 指令]

## 💡 示例 (Examples) - [可选]
[如果提供了示例，使用 Few-shot 格式]
**示例输入:**
> [输入示例]
**理想输出:**
> [输出示例]

## ❌ 约束与限制 (Constraints)
你必须严格遵守以下规则：
* **禁止**：[AI绝对不能做的事情]。
* **必须**：[AI必须做的事情，例如语气、风格]。
* **关于 [主题X]**：[关于特定主题的详细规则]。

## 🧩 输出格式 (Output Format)
你的输出**必须**严格遵循以下 [例如：Markdown, JSON, XML] 格式。不得包含任何格式之外的寒暄或解释。
[如果格式复杂，请在此处提供一个结构模板]

## 🏁 启动指令
在开始执行任务前，请先回复：“我已准备就绪。请提供你的[输入/请求]。”`,

  // 模板 2：软件编程
  SOFTWARE_PROGRAMMING: `# 提示词：[例如：Python 专家代码生成器]

## 🎭 角色 (Role)
你将扮演一名 [例如：拥有15年经验的、注重安全和性能的Python架构师]。

## 🎯 核心任务 (Core Task)
你的任务是 [例如：编写、调试、重构或解释] 符合以下所有要求的代码。

## 📜 背景与上下文 (Context)
* **项目目标**：[代码的预期用途]。
* **技术栈**：[例如：Python 3.10, Django 4.0, PostgreSQL]。
* **依赖库**：[必须使用或避免的库]。

## 📋 任务需求 (Task Requirements)
你必须生成满足以下所有需求的代码：
1.  **[功能 1]**：[详细的功能描述]。
2.  **[功能 2]**：[... ]
3.  **[错误处理]**：[必须包含的错误处理逻辑]。

## ❌ 约束与限制 (Constraints)
* **代码风格**：[例如：严格遵守 PEP 8 规范]。
* **禁止**：[例如：禁止使用 \`eval()\` 函数，禁止使用第三方库]。
* **性能**：[代码必须高效且内存占用低]。
* **安全**：[必须防止 SQL 注入、XSS 等攻击]。

## 🧩 输出格式 (Output Format)
你的输出**必须**严格遵循以下格式：
1.  **[简要说明]**：对代码功能的简要中文说明。
2.  **[代码块]**：只提供完整的、可直接运行的代码块，并正确标记语言（例如：\` \`\`python \`\`\`）。
3.  **[依赖项]**：(如果适用) 列出所需的 \`requirements.txt\`。

## 🏁 启动指令
在开始执行任务前，请先回复：“我已准备就绪。请提供你的需求。”`,

  // 模板 3：图像生成
  IMAGE_GENERATION: `# 提示词：[此处填写清晰的图像主题标题，例如：未来赛博朋克城市]

## 🎭 角色 (Role)
你将扮演一名 [例如：世界顶级的数码概念艺术家、专业电影摄影师或风格大师]。

## 🎯 核心任务 (Core Task)
你的主要任务是**组合一个高度精确、结构化且关键词丰富的英文提示词串**，以最大限度地生成符合用户意图的高质量图像。

## 📜 创意要求 (Creative Context)
[此处插入图像背后的故事、情绪或想要传达的深层概念]。

## 📋 详细构成 (Detailed Composition Steps)
你必须严格按照以下步骤，并将每个步骤的结果用**英文逗号**连接起来：
1.  **主体 (Subject)**：描述核心对象（人物、动物、物体），包括其动作、情绪和主要特征。
2.  **环境/背景 (Environment/Setting)**：描述场景、时间（日/夜）、天气和氛围。
3.  **风格与媒介 (Style & Medium)**：指定艺术风格（例如：油画、水彩、像素艺术）、媒介（例如：数码艺术、粘土模型）和参考艺术家（可选）。
4.  **光照与色彩 (Lighting & Color)**：定义光源类型（例如：体积光、电影光）、方向、色彩调性（例如：霓虹蓝、柔和暖色）。
5.  **细节与质量 (Details & Quality)**：加入提高质量的通用关键词（例如：超现实、8K、极度细节、史诗级构图）。

## ❌ 约束与限制 (Constraints)
* **语言**：最终输出**必须是完整的英文提示词串**。
* **格式**：最终输出**必须是单行文本**，所有元素仅用英文逗号和空格分隔。
* **禁止**：禁止在最终提示词中包含解释性或非描述性的文字。
* **参数**：如果用户指定了参数，必须将其放置在提示词的**末尾**（例如：\`--ar 16:9 --s 250\`）。

## 🧩 输出格式 (Output Format)
你的输出**必须**严格遵循以下结构（注意：它不是 Markdown，而是**最终的英文提示词串**）：

[英文主体描述], [英文环境描述], [英文风格/媒介], [英文光照/色彩], [英文质量细节], [参数 (可选)]

## 🏁 启动指令
在开始执行任务前，请先回复：“我已准备就绪。请提供您的图像创作想法。”`
};

// 模型优化规则实现
const MODEL_OPTIMIZATION_RULES: Record<string, (template: string) => string> = {
  [TargetModel.GPT]: (template: string) => template, // 默认使用Markdown
  [TargetModel.CLAUDE]: (template: string) => {
    // 将Markdown转换为XML标签格式
    return template
      .replace(/## 🎭 角色 \(Role\)\n([^#]+)/g, '<role>$1</role>')
      .replace(/## 🎯 核心任务 \(Core Task\)\n([^#]+)/g, '<task>$1</task>')
      .replace(/## 📋 (详细步骤|任务需求|详细构成) \([^)]+\)\n([^#]+)/g, '<task_steps>$2</task_steps>')
      .replace(/## ❌ 约束与限制 \(Constraints\)\n([^#]+)/g, '<constraints>$1</constraints>')
      .replace(/## 💡 示例 \(Examples\) - \[可选\]\n([^#]+)/g, '<examples>$1</examples>');
  },
  [TargetModel.MIDJOURNEY]: () => TEMPLATE_LIBRARY.IMAGE_GENERATION,
  [TargetModel.STABLE_DIFFUSION]: () => TEMPLATE_LIBRARY.IMAGE_GENERATION,
  [TargetModel.LLAMA]: (template: string) => template, // 同GPT
  [TargetModel.OTHER]: (template: string) => template
};

// 获取API密钥
const getApiKey = (): string => {
  // 只使用localStorage中的API密钥，确保API密钥只通过界面配置
  const apiKey = localStorage.getItem('siliconflow_api_key');
  if (!apiKey) {
    throw new Error('硅基流动API密钥未设置。请在设置中手动输入API密钥。');
  }
  // 确保API密钥格式正确（去除前后空格）
  const trimmedApiKey = apiKey.trim();
  return trimmedApiKey;
};

// 智能意图分析函数
const analyzeIntent = (userInput: string, conversationHistory: Message[] = []): IntentType => {
  const input = userInput.toLowerCase();
  
  // 分析对话上下文
  const context = conversationHistory.map(msg => 
    typeof msg.content === 'string' ? msg.content : ''
  ).join(' ').toLowerCase();
  
  // 基于上下文和当前输入的智能分析
  const fullContext = context + ' ' + input;
  
  // 图像生成相关关键词（更自然的表达）
  const imageKeywords = [
    '图片', '图像', '生成', '绘画', '设计', '视觉', '照片', '画面',
    'midjourney', 'stable diffusion', 'dall-e', '海边', '少女', '草帽',
    '海风', '比基尼', '俯视', '清晨', '特写', '近景', '现实主义', '写实'
  ];
  
  // 编程相关关键词
  const programmingKeywords = [
    '代码', '编程', '开发', 'python', 'javascript', 'java', '函数',
    '算法', '调试', '程序', '软件', '应用'
  ];
  
  // 复杂推理相关关键词
  const reasoningKeywords = [
    '分析', '推理', '逻辑', '思考', '解决', '决策', '为什么', '如何',
    '步骤', '原因', '结论', '论证'
  ];
  
  // 结构化数据相关关键词
  const dataKeywords = [
    '数据', '表格', 'excel', 'json', 'xml', '结构化', '数据库', '分析'
  ];
  
  // 基于关键词匹配和上下文理解
  const imageMatch = imageKeywords.filter(keyword => fullContext.includes(keyword)).length;
  const programmingMatch = programmingKeywords.filter(keyword => fullContext.includes(keyword)).length;
  const reasoningMatch = reasoningKeywords.filter(keyword => fullContext.includes(keyword)).length;
  const dataMatch = dataKeywords.filter(keyword => fullContext.includes(keyword)).length;
  
  // 根据匹配程度和上下文权重决定意图
  if (imageMatch > 3 || (imageMatch > 1 && programmingMatch === 0 && reasoningMatch === 0)) {
    return IntentType.IMAGE_GENERATION;
  }
  
  if (programmingMatch > 2) {
    return IntentType.SOFTWARE_PROGRAMMING;
  }
  
  if (reasoningMatch > 2) {
    return IntentType.COMPLEX_REASONING;
  }
  
  if (dataMatch > 2) {
    return IntentType.STRUCTURED_DATA;
  }
  
  // 如果用户明确提到摄影相关词汇，优先图像生成
  if (input.includes('摄影') || input.includes('摄影师') || input.includes('摄影大师') || 
      input.includes('照片') || input.includes('画面') || input.includes('构图')) {
    return IntentType.IMAGE_GENERATION;
  }
  
  return IntentType.GENERAL;
};

// 技术注入建议函数
const suggestTechniques = (intent: IntentType): PromptTechnique[] => {
  const techniques: PromptTechnique[] = [];
  
  if (intent === IntentType.COMPLEX_REASONING) {
    techniques.push(PromptTechnique.CHAIN_OF_THOUGHT);
  }
  
  if (intent === IntentType.SOFTWARE_PROGRAMMING) {
    techniques.push(PromptTechnique.FEW_SHOT);
  }
  
  if (intent === IntentType.IMAGE_GENERATION) {
    techniques.push(PromptTechnique.ZERO_SHOT);
  }
  
  return techniques;
};

// 选择模板函数
const selectTemplate = (intent: IntentType): string => {
  switch (intent) {
    case IntentType.SOFTWARE_PROGRAMMING:
      return TEMPLATE_LIBRARY.SOFTWARE_PROGRAMMING;
    case IntentType.IMAGE_GENERATION:
      return TEMPLATE_LIBRARY.IMAGE_GENERATION;
    case IntentType.COMPLEX_REASONING:
    case IntentType.STRUCTURED_DATA:
    case IntentType.GENERAL:
    default:
      return TEMPLATE_LIBRARY.GENERAL_REASONING;
  }
};

// 转换消息格式为自适应提示词工程系统格式（改进版）
const convertMessagesToAdaptiveFormat = (messages: Message[], targetModel: TargetModel = TargetModel.GPT, systemPrompt?: string): any[] => {
  const formattedMessages = [];

  // 如果提供了系统提示词，则添加（避免重复）
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }

  // 处理对话历史，保留最近5轮对话以保持上下文连贯性
  const recentMessages = messages.slice(-10); // 保留最近10条消息（约5轮对话）

  recentMessages.forEach(msg => {
    if (msg.role === 'user') {
      let content = '';
      if (typeof msg.content === 'string') {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        (msg.content as (string | FileContent)[]).forEach(part => {
          if (typeof part === 'string') {
            content += part;
          } else if (part.type === 'document') {
            content += `\n\n--- Attached Document: ${part.name} ---\n\n${part.data}`;
          }
        });
      }
      formattedMessages.push({ role: 'user', content });
    } else if (msg.role === 'assistant') {
      if (typeof msg.content === 'string') {
        formattedMessages.push({ role: 'assistant', content: msg.content });
      }
    }
  });

  return formattedMessages;
};

// 自适应对话处理接口
interface AdaptiveProcessConversationParams {
  messages: Message[];
  model?: string;
  temperature?: number;
  targetModel?: TargetModel;
  intent?: IntentType;
}

// 自适应对话处理函数
export const processAdaptiveConversation = async ({
  messages,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  targetModel = TargetModel.GPT,
  intent
}: AdaptiveProcessConversationParams): Promise<AdaptivePromptResult> => {
  try {
    const apiKey = getApiKey();
    
    // 获取最新的用户输入用于意图分析
    const latestUserMessage = messages.filter(msg => msg.role === 'user').pop();
    let userInput = '';
    
    if (latestUserMessage) {
      if (typeof latestUserMessage.content === 'string') {
        userInput = latestUserMessage.content;
      } else if (Array.isArray(latestUserMessage.content)) {
        (latestUserMessage.content as (string | FileContent)[]).forEach(part => {
          if (typeof part === 'string') {
            userInput += part;
          }
        });
      }
    }
    
    // 分析意图（如果未提供），使用对话上下文
    const detectedIntent = intent || analyzeIntent(userInput, messages);
    
    // 简化逻辑：专注于用户需求，而非技术细节
    // 不再强制应用模板和技术优化，让AI模型自主判断最佳生成方式
    
    // 构建专业提示词创作助手系统提示词（V3.0补丁优化版）
    const adaptiveSystemPrompt = `你是一个专业的提示词工程专家。您的核心使命是在[生成区]生成结构化、专业的提示词。

## 核心逻辑更新：智能意图分析
您必须首先对用户的第一条消息进行意图分析，并根据分析结果执行不同的对话路径。

### 意图1：GREETING (仅问候)
触发条件：用户输入为"你好"、"Hi"、"在吗？"等简单问候语。
禁止行为：禁止立即询问所有问题（如任务、约束等）。
执行动作：
- 礼貌回应："您好，我是您的专属提示词工程专家。"
- 主动引导角色选择："为了帮您构建最专业的提示词，我们通常从定义AI的'角色'开始。您希望AI扮演哪种类型的专家？"
- 提供分类选项（非必选）：
  "A. 创意与写作（如：营销文案、小说家、编剧）"
  "B. 编程与技术（如：Python专家、数据库管理员、安全架构师）"
  "C. 视觉与艺术（如：Midjourney绘画大师、摄影师、UI/UX设计师）"
  "D. 分析与策略（如：数据分析师、商业顾问、Excel专家）"
  "E. 或者，您可以直接输入一个更具体的自定义角色（例如：'一位精通唐代历史的学者'）"

### 意图2：PRE-BUILT PROMPT (已有的提示词)
触发条件：用户输入明显是一个已成型（但可能不完美）的提示词，包含了角色、任务等元素。
禁止行为：禁止从头开始提问（如"你想让AI扮演什么角色？"）。
执行动作：
- 确认与解析："感谢您提供了一个很棒的初始提示词。我已经按照专业结构将其解析为以下几个部分："
- 结构化分解（在[对话区]展示）：
  - 检测到的角色：[AI提取的角色]
  - 检测到的任务：[AI提取的任务]
  - 检测到的格式：[AI提取的格式]
  - 检测到的约束：[AI提取的约束]
- 引导优化："基于这个结构，我们可以在几个方面对其进行强化，例如增加'示例（Few-shot）'或明确'约束'。您想首先优化哪一部分？"

### 意图3：SIMPLE IDEA (简单想法)
触发条件：用户输入是一个简单的目标（如"帮我写代码"、"画只猫"、"写个周报"）。
执行动作：
- 执行V3.0的标准流程：从询问"角色"开始（"好的，一个[写代码]任务。您希望AI扮演一个什么样的专家角色？"）。
- 在角色确定后，主动提供示例：当用户确认角色后（例如："Python专家"），您应该说："角色已设定。接下来我们需要定义'任务'、'约束'和'输出格式'。需要我先在右侧[生成区]为您生成一个专业的'Python专家'示例模板，您再告诉我需要调整的地方吗？"

## 根本原则：对话的最终目标（强化V3.0）
[对话区]（左侧）是唯一的"对话"区域。您的所有提问、引导、建议和示例分析都必须在此处发生。
禁止在[对话区]生成最终提示词。您不能在对话中直接给用户一个（非结构化的）提示词，即使它看起来很好。
强制的生成请求：您在[对话区]的每一次引导或迭代，都必须以一个"请求生成"的问题来结束。

## 输出格式
请以JSON格式返回结果：
{
  "needsClarification": true/false,
  "clarificationQuestion": "澄清问题的内容（当needsClarification为true时）",
  "prompt": "专业优化的提示词（当needsClarification为false时）",
  "explanation": "简单易懂的专业解析",
  "suggestions": ["实用的改进建议"],
  "conversationSummary": "当前对话的简要总结"
}

## 示例
### 示例1：用户说"你好"
输出：
{
  "needsClarification": true,
  "clarificationQuestion": "您好，我是您的专属提示词工程专家。为了帮您构建最专业的提示词，我们通常从定义AI的'角色'开始。您希望AI扮演哪种类型的专家？\n\nA. 创意与写作（如：营销文案、小说家、编剧）\nB. 编程与技术（如：Python专家、数据库管理员、安全架构师）\nC. 视觉与艺术（如：Midjourney绘画大师、摄影师、UI/UX设计师）\nD. 分析与策略（如：数据分析师、商业顾问、Excel专家）\nE. 或者，您可以直接输入一个更具体的自定义角色（例如：'一位精通唐代历史的学者'）",
  "prompt": "",
  "explanation": "",
  "suggestions": [],
  "conversationSummary": "用户打招呼，引导角色选择"
}

### 示例2：用户说"帮我写一个Python爬虫"
输出：
{
  "needsClarification": true,
  "clarificationQuestion": "好的，一个Python爬虫任务。您希望AI扮演一个什么样的专家角色？\n\n需要我先在右侧[生成区]为您生成一个专业的'Python爬虫专家'示例模板，您再告诉我需要调整的地方吗？",
  "prompt": "",
  "explanation": "",
  "suggestions": [],
  "conversationSummary": "用户提出Python爬虫需求，引导角色确认和生成请求"
}

请记住：目标是构建专业、结构化的提示词，通过智能对话引导用户明确需求，最终在[生成区]生成高质量的提示词。`;

    const formattedMessages = [
      { role: 'system', content: adaptiveSystemPrompt },
      ...convertMessagesToAdaptiveFormat(messages, targetModel, adaptiveSystemPrompt)
    ];

    const response = await fetch(`${SILICONFLOW_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: temperature,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorData.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('API返回了空响应');
    }

    // 解析自适应响应
    let adaptiveResult;
    let cleanedContent = content;
    
    // 尝试清理JSON响应中的无效字符
    try {
      // 移除JSON字符串中的控制字符
      cleanedContent = cleanedContent.replace(/[\x00-\x1F\x7F]/g, '');
      
      // 检查是否是有效的JSON字符串
      if (typeof cleanedContent !== 'string') {
        throw new Error('响应内容不是字符串');
      }
      
      // 确保内容以JSON格式开始和结束
      if (!cleanedContent.trim().startsWith('{')) {
        // 尝试提取JSON对象
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[0];
        } else {
          throw new Error('无法找到有效的JSON对象');
        }
      }
      
      // 验证JSON格式
      const parsed = JSON.parse(cleanedContent);
      
      // 确保解析结果是对象而不是字符串
      if (typeof parsed === 'string') {
        throw new Error('解析结果是字符串而不是对象');
      }
      
      adaptiveResult = parsed;
    } catch (parseError) {
      console.error('JSON解析失败，原始内容:', content);
      console.error('清理后内容:', cleanedContent);
      console.error('解析错误:', parseError);
      
      // 尝试手动构建响应作为备用方案
      adaptiveResult = {
        prompt: userInput || '请提供更详细的需求描述',
        explanation: '基于您的需求生成的专业提示词',
        suggestions: ['您可以进一步细化需求以获得更精确的提示词'],
        conversationSummary: `用户想要${detectedIntent}`
      };
    }

    // 验证响应结构（适配新的简化格式）
    if (!adaptiveResult.prompt) {
      console.warn('API返回了不完整的响应格式，使用备用数据');
      // 确保必要字段存在
      adaptiveResult.prompt = adaptiveResult.prompt || '请提供更详细的需求描述';
      adaptiveResult.explanation = adaptiveResult.explanation || '生成的专业提示词已优化完成';
      adaptiveResult.suggestions = adaptiveResult.suggestions || ['您可以继续优化提示词或尝试不同的目标模型'];
      adaptiveResult.conversationSummary = adaptiveResult.conversationSummary || `用户想要${detectedIntent}`;
      adaptiveResult.needsClarification = adaptiveResult.needsClarification || false;
      adaptiveResult.clarificationQuestion = adaptiveResult.clarificationQuestion || '请告诉我您想要生成什么样的提示词？';
    }

    return {
      prompt: adaptiveResult.prompt,
      intent: adaptiveResult.intent || detectedIntent,
      targetModel: adaptiveResult.targetModel || 'deepseek-ai/DeepSeek-V3',
      techniques: adaptiveResult.techniques || [],
      templateUsed: adaptiveResult.templateUsed || 'default',
      explanation: adaptiveResult.explanation || '生成的专业提示词已优化完成',
      suggestions: adaptiveResult.suggestions || ['您可以继续优化提示词或尝试不同的目标模型'],
      conversationSummary: adaptiveResult.conversationSummary || `用户想要${detectedIntent}`,
      conversationHistory: messages,
      needsClarification: adaptiveResult.needsClarification || false,
      clarificationQuestion: adaptiveResult.clarificationQuestion || ''
    };

  } catch (error) {
    console.error('自适应对话处理错误:', error);
    throw error;
  }
};

// 硅基流动支持的模型列表
export const SUPPORTED_MODELS = [
    // 用户指定的内置模型
    {
        id: 'deepseek-ai/DeepSeek-V3.1-Terminus',
        name: 'DeepSeek-V3.1-Terminus',
        description: 'DeepSeek V3.1 Terminus版本，专业推理能力'
    },
    {
        id: 'deepseek-ai/DeepSeek-V3.2-Exp',
        name: 'DeepSeek-V3.2-Exp',
        description: 'DeepSeek V3.2 实验版本，最新功能'
    },
    {
        id: 'Qwen/Qwen3-VL-235B-A22B-Thinking',
        name: 'Qwen3-VL-235B-A22B-Thinking',
        description: '通义千问3多模态模型，支持视觉语言推理'
    },
    {
        id: 'zai-org/GLM-4.6',
        name: 'GLM-4.6',
        description: '清华智谱GLM-4.6最新版本'
    },
    
    // 其他常用模型
    {
        id: 'deepseek-ai/DeepSeek-V3',
        name: 'DeepSeek-V3',
        description: 'DeepSeek最新一代大模型，综合能力强'
    },
    {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen2.5-72B-Instruct',
        description: '通义千问2.5，72B参数指令模型'
    },
    {
        id: 'moonshotai/Moonshot-v1-128k',
        name: 'Moonshot-v1-128k',
        description: '月之暗面Kimi，支持128K上下文'
    },
    {
        id: 'THUDM/glm-4-9b-chat',
        name: 'GLM-4-9B-Chat',
        description: '清华智谱GLM-4对话模型'
    }
];

// 默认模型
export const DEFAULT_MODEL = SUPPORTED_MODELS[0].id;

// 验证API密钥
export const validateApiKey = async (apiKey: string): Promise<{ valid: boolean; message?: string }> => {
  try {
    // 使用聊天完成端点来验证API密钥，这是最可靠的验证方式
    const response = await fetch(`${SILICONFLOW_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        valid: false, 
        message: `API密钥验证失败: ${response.status} ${response.statusText} - ${errorData.error?.message || '请检查API密钥是否正确'}` 
      };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
};

// 获取支持的模型列表
export const getSupportedModels = (): { id: string; name: string; description: string; provider: string }[] => {
  return SUPPORTED_MODELS.map(model => ({
    id: model.id,
    name: model.name,
    description: model.description,
    provider: '硅基流动'
  }));
};