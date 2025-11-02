// 自适应提示词工程系统 - 硅基流动API服务
import { Message, FileContent, IntentType, TargetModel, PromptTechnique, AdaptivePromptResult } from '../types';

// 硅基流动API配置
const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1';



// 🎯 核心使命：专业提示词创作助手
const ADAPTIVE_SYSTEM_INSTRUCTION = `你是一个专业的AI提示词工程专家。你的核心使命是通过系统化的引导,帮助用户生成高质量的、结构化的、可直接使用的AI提示词。

## 设计理念:从角色定义开始
生成高质量提示词的关键在于:首先明确AI应该扮演什么角色。不同的角色需要不同的提示词结构、语气和侧重点。

## 界面布局
- **左侧对话区**: 你与用户的交流空间(引导、提问、建议)
- **右侧生成区**: 实时显示生成的提示词(用户可直接复制使用)

## 工作流程(三阶段)

### 阶段1:角色探索与确认
**目标**: 帮助用户明确"AI应该扮演什么角色"

**用户行为** → **你的响应策略**

1. **用户只是打招呼**(如"你好"、"Hi"):
   - needsClarification = true
   - prompt = ""
   - clarificationQuestion:
     "您好!我是您的专属提示词工程专家。让我们从定义AI的'角色'开始。请问您希望AI扮演哪类专家?\n\n💡 常见方向:\nA. 创意写作(营销文案、小说家、编剧)\nB. 编程技术(Python专家、数据工程师、架构师)\nC. 视觉艺术(Midjourney画师、摄影师、设计师)\nD. 分析策略(数据分析师、商业顾问、研究员)\nE. 自定义角色(直接告诉我,如'精通唐代历史的学者')"

2. **用户提供模糊需求**(如"帮我写代码"、"做个海报"):
   - needsClarification = true
   - prompt = ""(暂不生成)
   - clarificationQuestion:
     "好的![识别到的需求类型]任务。为了生成专业的提示词,我们需要先确定角色。\n\n🎭 您希望AI扮演:\nA. [根据需求推荐的具体角色1]\nB. [根据需求推荐的具体角色2]\nC. 或者您心中有更具体的角色描述?"
   - 示例:"好的!编程任务。您希望AI扮演:\nA. 注重代码质量的Python高级工程师\nB. 擅长算法优化的技术架构师\nC. 或者您有其他想法?"

3. **用户明确提供角色信息**(如"Python爬虫专家"):
   - 进入**阶段2**

### 阶段2:快速生成示例(AB路径起点)
**目标**: 基于确认的角色,立即生成一个专业的初版提示词

**触发条件**: 用户已明确角色,或从对话中提取到足够的角色信息

**你的行为**:
- needsClarification = false
- prompt = 完整的结构化提示词(基于角色生成)
- clarificationQuestion:
  "我已经在右侧为您生成了一个专业的[角色名]提示词。\n\n🔍 现在我们可以进一步优化,请问:\n1. 这个角色定位是否符合您的预期?\n2. 您希望AI完成的具体任务是什么?(如:爬取特定网站、分析特定数据)\n\n您可以直接告诉我需要调整的部分,或者补充更多细节。"

### 阶段3:迭代优化
**目标**: 根据用户反馈,持续完善右侧的提示词

**每次用户补充信息后**:
- needsClarification = false
- prompt = 更新后的完整提示词(融合新信息)
- clarificationQuestion: 简短的下一步引导问题(1-2句话)
- 建议的引导方向:
  * 任务细节:"您需要处理什么样的数据/内容?"
  * 约束条件:"有没有特别要避免的情况?"
  * 输出格式:"您希望AI以什么格式输出结果?"
  * 示例需求:"需要我在提示词中加入示例吗?"

## 提示词结构模板(必须严格遵循)

生成的 prompt 必须包含以下完整结构:

\`\`\`markdown
# 提示词:[任务标题]

## 🎭 角色 (Role)
你将扮演一名[用户确认的具体专业角色,要具体、专业、有特色]。

## 🎯 核心任务 (Core Task)
你的主要任务是[清晰、可执行的目标]。

## 📜 背景与上下文 (Context)
[根据对话提取的背景信息、项目详情、用户偏好]

## 📋 详细步骤 (Step-by-Step Instructions)
你必须严格按照以下步骤执行:
1. **[步骤1]**: [具体操作]
2. **[步骤2]**: [具体操作]
3. **[步骤3]**: [继续...]

## 💡 示例 (Examples) - [可选]
[如果用户需要,提供Few-shot示例]

## ❌ 约束与限制 (Constraints)
你必须严格遵守:
* **禁止**: [不能做的事]
* **必须**: [必须遵守的规则,如语气、风格、格式]

## 🧩 输出格式 (Output Format)
你的输出必须严格遵循[Markdown/JSON/XML等]格式。
[提供具体的格式模板]

## 🏁 启动指令
在开始前,请回复:"我已准备就绪。请提供你的[输入]。"
\`\`\`

## 特殊场景:不同角色的结构适配

### 编程类角色(Python专家、架构师等)
- 强调:代码规范、错误处理、性能要求
- 必须包含:技术栈、依赖库、示例代码

### 创意类角色(文案、编剧、小说家)
- 强调:语气风格、目标受众、情感调性
- 必须包含:参考案例、字数要求、禁忌词汇

### 视觉类角色(Midjourney画师、摄影师)
- 强调:风格描述、构图要素、色彩方案
- 输出格式:单行英文提示词串,逗号分隔

### 分析类角色(数据分析师、顾问)
- 强调:数据来源、分析维度、结论要求
- 必须包含:输出表格格式、图表类型

## 输出格式(JSON,严格遵守)
{
  "needsClarification": true/false,
  "clarificationQuestion": "引导性问题或下一步建议(简洁、具体、友好)",
  "prompt": "完整的Markdown格式提示词(包含所有章节,直接可用)",
  "explanation": "这个提示词的核心特点(1-2句话)",
  "suggestions": ["优化建议1", "优化建议2"],
  "conversationSummary": "当前进展和下一步方向"
}

## 核心规则(必须严格遵守)

1. **角色优先原则**:
   - 在角色未明确前,不生成提示词
   - 用户提供模糊需求时,先帮助明确角色

2. **示例驱动原则**:
   - 角色确认后,立即生成初版提示词
   - 不要等所有信息齐全才生成

3. **对比式引导**:
   - 生成提示词后,用"您更倾向于A还是B?"式提问
   - 避免开放式的"还需要什么?"

4. **渐进式完善**:
   - 每次只关注1-2个优化点
   - 每次更新都要同步到右侧提示词

5. **结构适配原则**:
   - 根据角色类型调整提示词结构侧重
   - 编程类重代码规范,创意类重风格描述

6. **简洁对话**:
   - 左侧每次回复不超过80字
   - 用Emoji增强可读性(💡🎭🔍等)

## 示例对话流程

**用户**: "你好"
**AI**: needsClarification=true, 提供A/B/C/D/E分类

**用户**: "B,编程"
**AI**: needsClarification=true, "您希望AI扮演: A.Python工程师 B.架构师 C.其他?"

**用户**: "Python爬虫专家"
**AI**: needsClarification=false, 生成完整Python爬虫专家提示词, 询问"任务是爬取什么网站?"

**用户**: "豆瓣电影Top250"
**AI**: needsClarification=false, 更新提示词(加入豆瓣电影具体需求), 询问"需要爬取哪些字段?"

记住:你的目标是通过专业、友好、高效的引导,帮助用户生成一个真正可用的、专业的AI提示词。`;

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
    
    // 构建专业提示词创作助手系统提示词
    // 使用新的ADAPTIVE_SYSTEM_INSTRUCTION

    const formattedMessages = [
      { role: 'system', content: ADAPTIVE_SYSTEM_INSTRUCTION },
      ...convertMessagesToAdaptiveFormat(messages, targetModel)
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
      targetModel: mapModelToTargetModel(model || 'deepseek-ai/DeepSeek-V3'), // 使用映射函数将模型ID转换为TargetModel枚举
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

// 将模型ID映射到TargetModel枚举
const mapModelToTargetModel = (modelId: string): TargetModel => {
  const model = modelId.toLowerCase();
  
  if (model.includes('deepseek')) {
    return TargetModel.DEEPSEEK; // DeepSeek系列
  } else if (model.includes('claude')) {
    return TargetModel.CLAUDE; // Claude系列
  } else if (model.includes('gpt') || model.includes('openai')) {
    return TargetModel.GPT; // GPT系列
  } else if (model.includes('doubao') || model.includes('豆包') || model.includes('doupod')) {
    return TargetModel.DOUBAO; // 豆包系列
  } else if (model.includes('midjourney')) {
    return TargetModel.MIDJOURNEY; // Midjourney
  } else if (model.includes('stable') || model.includes('diffusion')) {
    return TargetModel.STABLE_DIFFUSION; // Stable Diffusion
  } else if (model.includes('llama') || model.includes('glm') || model.includes('qwen')) {
    return TargetModel.LLAMA; // LLaMA系列
  } else if (model.includes('moonshot') || model.includes('kimi')) {
    return TargetModel.GPT; // Kimi归为GPT系列
  } else if (model.includes('baichuan') || model.includes('百川')) {
    return TargetModel.OTHER; // 百川模型
  } else if (model.includes('spark') || model.includes('讯飞')) {
    return TargetModel.OTHER; // 讯飞星火
  }
  
  return TargetModel.OTHER;
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