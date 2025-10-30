import React, { useState, useRef, useEffect } from 'react';
import { Message, SavedPrompt, FileContent, IntentType, TargetModel, AdaptivePromptResult } from '../types';
import { processConversation, validateApiKey, getSupportedModels } from '../services/aiService';
import { SparklesIcon, ClipboardIcon, BookmarkIcon, PaperClipIcon, TrashIcon, FolderIcon, XMarkIcon, HistoryIcon, DocumentIcon, CogIcon, ViewColumnsIcon, UserIcon } from './icons';



const ChatView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [uploadedFile, setUploadedFile] = useState<FileContent | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
    const [adaptiveResult, setAdaptiveResult] = useState<AdaptivePromptResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // 自适应系统状态
    const [targetModel, setTargetModel] = useState<TargetModel>(TargetModel.GPT);
    const [detectedIntent, setDetectedIntent] = useState<IntentType>(IntentType.GENERAL);

    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [promptNameToSave, setPromptNameToSave] = useState('');

    // AI服务配置状态
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isValidatingApiKey, setIsValidatingApiKey] = useState(false);
    const [apiKeyStatus, setApiKeyStatus] = useState<'valid' | 'invalid' | 'unchecked'>('unchecked');
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [isValidatingGoogleApiKey, setIsValidatingGoogleApiKey] = useState(false);
    const [googleApiKeyStatus, setGoogleApiKeyStatus] = useState<'valid' | 'invalid' | 'unchecked'>('unchecked');
    const [selectedModel, setSelectedModel] = useState('');
    const [customModelName, setCustomModelName] = useState('');

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 加载保存的配置
    useEffect(() => {
        try {
            const storedPrompts = localStorage.getItem('savedPrompts');
            if (storedPrompts) {
                setSavedPrompts(JSON.parse(storedPrompts));
            }
            
            // 加载API密钥
            const savedApiKey = localStorage.getItem('siliconflow_api_key') || '';
            setApiKey(savedApiKey);
            
            // 加载Google API密钥
            const savedGoogleApiKey = localStorage.getItem('google_api_key') || '';
            setGoogleApiKey(savedGoogleApiKey);
            
            // 加载选中的模型
            const savedModel = localStorage.getItem('selected_model') || '';
            // 检查保存的模型是否在支持的模型列表中，如果不在则视为自定义模型
            const supportedModels = getSupportedModels();
            if (savedModel && !supportedModels.some(model => model.id === savedModel)) {
                setSelectedModel('custom');
                setCustomModelName(savedModel);
            } else {
                setSelectedModel(savedModel);
            }
            
        } catch (e) {
            console.error("Failed to load or parse saved prompts:", e);
            localStorage.removeItem('savedPrompts');
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleNewChat = () => {
        setMessages([]);
        setGeneratedPrompt('');
        setUserInput('');
        setUploadedFile(null);
    };

    const handleSend = async () => {
        if (!userInput.trim() && !uploadedFile) return;

        // 检查API密钥是否设置
        if (!apiKey) {
            setShowSettingsModal(true);
            return;
        }

        setIsLoading(true);
        setIsGenerating(true);
        const contentParts: (string | FileContent)[] = [];
        if (userInput.trim()) contentParts.push(userInput.trim());
        if (uploadedFile) contentParts.push(uploadedFile);

        const newUserMessage: Message = { role: 'user', content: contentParts };
        const newMessages = [...messages, newUserMessage];
        setMessages(newMessages);
        setUserInput('');
        setUploadedFile(null);
        
        try {
            // 提取用户输入文本
            const userInputText = typeof newUserMessage.content === 'string' 
                ? newUserMessage.content 
                : (newUserMessage.content as (string | FileContent)[])
                    .filter(part => typeof part === 'string')
                    .join(' ');
            
            // 简化的意图分析 - 不再强制分类
            let detectedIntent = IntentType.GENERAL;
            if (userInputText.includes('代码') || userInputText.includes('编程') || userInputText.includes('开发')) {
                detectedIntent = IntentType.SOFTWARE_PROGRAMMING;
            } else if (userInputText.includes('图片') || userInputText.includes('图像') || userInputText.includes('画') || userInputText.includes('生成图片')) {
                detectedIntent = IntentType.IMAGE_GENERATION;
            } else if (userInputText.includes('分析') || userInputText.includes('推理') || userInputText.includes('思考')) {
                detectedIntent = IntentType.COMPLEX_REASONING;
            }
            setDetectedIntent(detectedIntent);
            
            // 简化的目标模型识别
            let selectedTargetModel = TargetModel.GPT;
            if (userInputText.includes('Claude') || userInputText.includes('claude')) {
                selectedTargetModel = TargetModel.CLAUDE;
            } else if (userInputText.includes('Midjourney') || userInputText.includes('midjourney') || userInputText.includes('MJ')) {
                selectedTargetModel = TargetModel.MIDJOURNEY;
            } else if (userInputText.includes('Stable Diffusion') || userInputText.includes('stable diffusion') || userInputText.includes('SD')) {
                selectedTargetModel = TargetModel.STABLE_DIFFUSION;
            } else if (userInputText.includes('LLaMA') || userInputText.includes('llama')) {
                selectedTargetModel = TargetModel.LLAMA;
            }
            setTargetModel(selectedTargetModel);
            
            // 使用选中的模型，如果没有选择则使用默认模型
            const modelToUse = selectedModel || undefined;
            
            // 直接生成提示词，不再进行复杂的信息收集流程
            const result: AdaptivePromptResult = await processConversation({ 
                messages: newMessages, 
                model: modelToUse,
                targetModel: selectedTargetModel,
                intent: detectedIntent
            });
            
            // 处理自适应结果
            setGeneratedPrompt(result.prompt);
            setAdaptiveResult(result);
            
            // 根据是否需要澄清需求来生成不同的响应内容
            let assistantMessageContent = '';
            
            if (result.needsClarification) {
                // 需要进一步澄清需求 - 使用新的智能意图分析系统
                assistantMessageContent = `🤔 **专业提示词工程引导**

${result.clarificationQuestion}

💡 **提示**：请根据您的具体需求选择相应的选项或直接描述您的想法。我会在右侧[生成区]为您构建专业、结构化的提示词。`;
            } else {
                // 需求明确，生成提示词 - 确保包含强制生成请求
                if (result.intent === IntentType.IMAGE_GENERATION) {
                    assistantMessageContent = `🎨 **专业摄影提示词创作完成！**

我已经根据您的摄影需求，为您创作了高质量的图像生成提示词。

**创作说明：**
${result.explanation}

**优化建议：**
${result.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

✅ **需要我根据这些信息，在右侧[生成区]为您生成V1.0版本的专业提示词吗？**`;
                } else {
                    assistantMessageContent = `🎯 **专业提示词创作完成！**

我已经根据您的需求，为您创作了高质量的提示词。

**创作说明：**
${result.explanation}

**优化建议：**
${result.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

✅ **需要我根据这些信息，在右侧[生成区]为您生成V1.0版本的专业提示词吗？**`;
                }
            }
            
            const assistantMessage: Message = { 
                role: 'assistant', 
                content: assistantMessageContent
            };
            setMessages(prev => [...prev, assistantMessage]);
            
        } catch (error) {
            const errorMessage: Message = { 
                role: 'assistant', 
                content: `抱歉，处理请求时出现错误：${error.message || '请检查API密钥和网络连接'}` 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsGenerating(false);
        }
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        if (file.type.startsWith('image/')) {
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setUploadedFile({
                    name: file.name,
                    type: 'image',
                    data: base64String,
                    mimeType: file.type,
                });
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
             reader.onloadend = () => {
                setUploadedFile({
                    name: file.name,
                    type: 'document',
                    data: reader.result as string,
                    mimeType: file.type,
                });
            };
            reader.readAsText(file);
        }

        event.target.value = '';
    };

    const handleSavePrompt = () => {
        if (!generatedPrompt) return;
        setShowSaveModal(true);
    };

    const confirmSavePrompt = () => {
        if (!promptNameToSave.trim()) return;
        
        // 构建包含专业摄影元数据的提示词内容
        let promptContent = generatedPrompt;
        if (adaptiveResult) {
            promptContent = `# 🎨 专业摄影提示词创作 - 生成结果

**创作类型**: ${adaptiveResult.intent}
**目标模型**: ${adaptiveResult.targetModel}
**创作时间**: ${new Date().toLocaleString()}

---

${generatedPrompt}

---

**创作说明**: ${adaptiveResult.explanation}
**专业建议**: 如需调整构图、光线或细节，请告诉我您的具体需求`;
        }
        
        const newSavedPrompt: SavedPrompt = {
            id: Date.now().toString(),
            name: promptNameToSave,
            prompt: promptContent,
            timestamp: Date.now(),
        };
        const updatedPrompts = [newSavedPrompt, ...savedPrompts];
        setSavedPrompts(updatedPrompts);
        localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
        setShowSaveModal(false);
        setPromptNameToSave('');
    };
    
    const loadPrompt = (prompt: SavedPrompt) => {
        handleNewChat();
        setGeneratedPrompt(prompt.prompt);
        setMessages([{ role: 'assistant', content: `Loaded prompt: "${prompt.name}". You can now continue to refine it.`}]);
        setShowLibraryModal(false);
    }
    
    const deletePrompt = (id: string) => {
        const updatedPrompts = savedPrompts.filter(p => p.id !== id);
        setSavedPrompts(updatedPrompts);
        localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
    }
    
    const handleCopy = async () => {
        if (!generatedPrompt) return;
        
        try {
            // 构建要复制的内容
            let contentToCopy = generatedPrompt;
            
            // 如果有自适应结果，添加专业摄影元信息
            if (adaptiveResult) {
                contentToCopy = `# 🎨 专业摄影提示词创作 - 生成结果

**创作类型**: ${adaptiveResult.intent}
**目标模型**: ${adaptiveResult.targetModel}
**创作时间**: ${new Date().toLocaleString()}

---

${generatedPrompt}

---

**创作说明**: ${adaptiveResult.explanation}
**专业建议**: 如需调整构图、光线或细节，请告诉我您的具体需求`;
            }
            
            // 使用现代剪贴板API
            await navigator.clipboard.writeText(contentToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            // 如果现代API失败，使用备用方法
            try {
                // 构建要复制的内容
                let contentToCopy = generatedPrompt;
                
                // 如果有自适应结果，添加专业摄影元信息
                if (adaptiveResult) {
                    contentToCopy = `# 🎨 专业摄影提示词创作 - 生成结果

**创作类型**: ${adaptiveResult.intent}
**目标模型**: ${adaptiveResult.targetModel}
**创作时间**: ${new Date().toLocaleString()}

---

${generatedPrompt}

---

**创作说明**: ${adaptiveResult.explanation}
**专业建议**: 如需调整构图、光线或细节，请告诉我您的具体需求`;
                }
                
                // 创建临时textarea元素
                const textArea = document.createElement('textarea');
                textArea.value = contentToCopy;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                // 执行复制
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } else {
                    console.error('复制失败');
                    alert('复制失败，请手动选择文本进行复制');
                }
            } catch (fallbackError) {
                console.error('备用复制方法也失败:', fallbackError);
                alert('复制失败，请手动选择文本进行复制');
            }
        }
    };

    // AI设置相关函数
    const handleValidateApiKey = async () => {
        if (!apiKey.trim()) return;
        
        setIsValidatingApiKey(true);
        try {
            const isValid = await validateApiKey(apiKey);
            setApiKeyStatus(isValid ? 'valid' : 'invalid');
            
            if (isValid) {
                // 保存配置
                localStorage.setItem('siliconflow_api_key', apiKey);
            }
        } catch (error) {
            setApiKeyStatus('invalid');
        } finally {
            setIsValidatingApiKey(false);
        }
    };

    // 验证Google API密钥
    const handleValidateGoogleApiKey = async () => {
        if (!googleApiKey.trim()) return;
        
        setIsValidatingGoogleApiKey(true);
        try {
            // 简单的Google API密钥格式验证
            const isValid = googleApiKey.trim().length > 10 && googleApiKey.startsWith('AIza');
            setGoogleApiKeyStatus(isValid ? 'valid' : 'invalid');
            
            if (isValid) {
                // 保存配置
                localStorage.setItem('google_api_key', googleApiKey);
            }
        } catch (error) {
            setGoogleApiKeyStatus('invalid');
        } finally {
            setIsValidatingGoogleApiKey(false);
        }
    };

    const handleSaveSettings = () => {
        localStorage.setItem('siliconflow_api_key', apiKey);
        localStorage.setItem('google_api_key', googleApiKey);
        
        // 处理模型选择：如果选择了自定义模型，则使用自定义模型名称
        let modelToSave = selectedModel;
        if (selectedModel === 'custom' && customModelName.trim()) {
            modelToSave = customModelName.trim();
        }
        
        if (modelToSave) {
            localStorage.setItem('selected_model', modelToSave);
        }
        
        setShowSettingsModal(false);
    };

    return (
        <div className="flex h-full w-full gap-6">
            {/* Left Panel: Chat */}
            <div className="w-full lg:w-3/7 flex flex-col bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold">对话</h2>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setShowLibraryModal(true)} disabled={savedPrompts.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors disabled:opacity-50">
                            <FolderIcon className="w-4 h-4" />
                            我的提示词
                        </button>
                        <button onClick={handleNewChat} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors">
                            <HistoryIcon className="w-4 h-4" />
                            新对话
                        </button>
                    </div>
                </div>
                

                
                <div className="flex-grow p-4 overflow-y-auto min-h-0">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                {typeof msg.content === 'string' ? <p className="text-white whitespace-pre-wrap">{msg.content}</p> : (
                                    (msg.content as (string | FileContent)[]).map((part, partIndex) => {
                                        if(typeof part === 'string') return <p key={partIndex} className="text-white whitespace-pre-wrap">{part}</p>;
                                        if(part.type === 'image') return <img key={partIndex} src={`data:${part.mimeType};base64,${part.data}`} alt={part.name} className="rounded-md max-w-xs my-2"/>
                                        if(part.type === 'document') return (
                                            <div key={partIndex} className="bg-gray-900/50 p-2 rounded-md my-2">
                                                <p className="text-sm font-semibold text-gray-300">File: {part.name}</p>
                                            </div>
                                        )
                                        return null;
                                    })
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-2">
                               <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0s'}}></div>
                               <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0.2s'}}></div>
                               <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-gray-700 shrink-0">
                    {uploadedFile && (
                        <div className="mb-2 bg-gray-700 p-2 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <PaperClipIcon className="w-4 h-4" />
                                <span>{uploadedFile.name}</span>
                            </div>
                            <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-white">
                                <XMarkIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    )}
                    <div className="flex items-end gap-2 bg-gray-700 p-2 rounded-xl border border-gray-600 focus-within:border-indigo-500">
                        <textarea
                            ref={textareaRef}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="输入您的需求，上传文件，或粘贴链接进行分析..."
                            rows={1}
                            className="flex-grow bg-transparent text-gray-100 focus:outline-none resize-none placeholder-gray-400 max-h-48"
                        />
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.txt,.md" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white transition-colors rounded-md">
                            <PaperClipIcon className="w-6 h-6"/>
                        </button>
                        <button onClick={handleSend} disabled={isLoading || (!userInput.trim() && !uploadedFile)} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                            发送
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Prompt Workbench */}
            <div className="w-full lg:w-4/7 flex flex-col bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
                 <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold">生成的专业提示词</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors" title="API配置">
                            <CogIcon className="w-4 h-4" />
                            API配置
                        </button>
                        {adaptiveResult && (
                            <button 
                                onClick={handleCopy} 
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"
                                title="复制提示词"
                            >
                                <ClipboardIcon className="w-4 h-4" />
                                复制
                            </button>
                        )}
                        <button onClick={handleCopy} disabled={!generatedPrompt || isLoading} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors disabled:opacity-50">
                            <ClipboardIcon className="w-4 h-4" />
                            {copied ? '已复制!' : '复制'}
                        </button>
                        <button onClick={handleSavePrompt} disabled={!generatedPrompt || isLoading} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors disabled:opacity-50">
                            <BookmarkIcon className="w-4 h-4" />
                            保存
                        </button>
                    </div>
                </div>
                <div className="flex-grow p-4 overflow-y-auto bg-gray-900 m-4 rounded-lg border border-gray-700 min-h-0">
                    {generatedPrompt ? (
                        <div>
                            {/* 生成状态提示 */}
                            {isGenerating && (
                                <div className="mb-4 bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
                                    <div className="flex items-center text-yellow-400">
                                        <span className="mr-2">🔍</span>
                                        <span className="font-medium">正在生成提示词...</span>
                                    </div>
                                    <p className="text-sm text-yellow-300 mt-1">
                                        正在根据您的需求生成专业提示词
                                    </p>
                                </div>
                            )}

                            {/* 直接显示生成的提示词 */}
                            <pre className="text-gray-200 whitespace-pre-wrap font-sans text-sm leading-relaxed mb-4">{generatedPrompt}</pre>
                            
                            {/* 整合的创作说明 */}
                            {adaptiveResult && (
                                <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                                    <h4 className="font-medium text-blue-400 mb-2">💡 创作说明</h4>
                                    <div className="space-y-2">
                                        {adaptiveResult.explanation && (
                                            <p className="text-sm text-blue-300">{adaptiveResult.explanation}</p>
                                        )}
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                                            <div><span className="font-medium">意图：</span>{adaptiveResult.intent}</div>
                                            <div><span className="font-medium">模型：</span>{adaptiveResult.targetModel}</div>
                                            <div><span className="font-medium">类型：</span>
                                                {adaptiveResult.intent === 'IMAGE_GENERATION' ? '图像创作' : 
                                                 adaptiveResult.intent === 'SOFTWARE_PROGRAMMING' ? '软件编程' : 
                                                 adaptiveResult.intent === 'COMPLEX_REASONING' ? '复杂推理' : '通用创作'}
                                            </div>
                                            <div><span className="font-medium">时间：</span>{new Date().toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <SparklesIcon className="w-12 h-12 mb-4"/>
                            <p className="font-semibold">
                                {isGenerating 
                                    ? '正在为您生成专业提示词...'
                                    : '您的专业提示词将在此处显示'
                                }
                            </p>
                            <p className="text-sm">
                                在左侧开始对话即可生成专业提示词。
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">保存提示词</h3>
                        <input
                            type="text"
                            value={promptNameToSave}
                            onChange={(e) => setPromptNameToSave(e.target.value)}
                            placeholder="为您的提示词命名..."
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">取消</button>
                            <button onClick={confirmSavePrompt} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50" disabled={!promptNameToSave.trim()}>保存</button>
                        </div>
                    </div>
                </div>
            )}
            
             {/* Library Modal */}
             {showLibraryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                            <h3 className="text-xl font-semibold text-white">我的提示词库</h3>
                            <button onClick={() => setShowLibraryModal(false)} className="text-gray-400 hover:text-white">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                            {savedPrompts.map(p => (
                                <div key={p.id} className="bg-gray-900 p-4 rounded-lg">
                                    <p className="font-bold text-white">{p.name}</p>
                                    <p className="text-gray-400 text-sm truncate my-2">{p.prompt}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <button onClick={() => loadPrompt(p)} className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md">加载</button>
                                        <button onClick={() => deletePrompt(p.id)} className="p-1 text-red-400 hover:text-red-300 rounded-md"><TrashIcon className="w-4 h-4"/></button>
                                        <span className="text-xs text-gray-500 ml-auto">{new Date(p.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 text-white">AI服务设置</h3>
                        
                        {/* 服务提供商信息 */}
                        <div className="bg-gray-900 p-3 rounded-md mb-4">
                            <p className="text-sm text-gray-300">
                                <span className="font-medium text-white">服务提供商：</span>
                                硅基流动
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                支持 DeepSeek、千文、Kimi 等国产大模型
                            </p>
                        </div>

                        {/* 模型选择 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                选择模型
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white mb-2"
                            >
                                <option value="">使用默认模型</option>
                                {getSupportedModels().map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.name}
                                    </option>
                                ))}
                                <option value="custom">自定义模型</option>
                            </select>
                            
                            {/* 自定义模型输入 */}
                            {selectedModel === 'custom' && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={customModelName}
                                        onChange={(e) => setCustomModelName(e.target.value)}
                                        placeholder="输入自定义模型名称，例如：deepseek-ai/DeepSeek-V3.1-Terminus"
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        请输入完整的模型ID，格式为：provider/model-name
                                    </p>
                                </div>
                            )}
                            
                            {selectedModel && selectedModel !== 'custom' && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {getSupportedModels().find(m => m.id === selectedModel)?.description}
                                </p>
                            )}
                        </div>

                        {/* API密钥输入 - 硅基流动 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                API密钥 (硅基流动)
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setApiKeyStatus('unchecked');
                                }}
                                placeholder="输入硅基流动API密钥"
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <button 
                                    onClick={handleValidateApiKey}
                                    disabled={!apiKey.trim() || isValidatingApiKey}
                                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded-md disabled:opacity-50"
                                >
                                    {isValidatingApiKey ? '验证中...' : '验证密钥'}
                                </button>
                                {apiKeyStatus === 'valid' && (
                                    <span className="text-green-400 text-sm">✓ 密钥有效</span>
                                )}
                                {apiKeyStatus === 'invalid' && (
                                    <span className="text-red-400 text-sm">✗ 密钥无效</span>
                                )}
                            </div>
                        </div>

                        {/* API密钥输入 - Google AI */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                API密钥 (Google AI Studio)
                            </label>
                            <input
                                type="password"
                                value={googleApiKey}
                                onChange={(e) => {
                                    setGoogleApiKey(e.target.value);
                                    setGoogleApiKeyStatus('unchecked');
                                }}
                                placeholder="输入Google AI Studio API密钥"
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <button 
                                    onClick={handleValidateGoogleApiKey}
                                    disabled={!googleApiKey.trim() || isValidatingGoogleApiKey}
                                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded-md disabled:opacity-50"
                                >
                                    {isValidatingGoogleApiKey ? '验证中...' : '验证密钥'}
                                </button>
                                {googleApiKeyStatus === 'valid' && (
                                    <span className="text-green-400 text-sm">✓ 密钥有效</span>
                                )}
                                {googleApiKeyStatus === 'invalid' && (
                                    <span className="text-red-400 text-sm">✗ 密钥无效</span>
                                )}
                            </div>
                        </div>

                        {/* 帮助信息 */}
                        <div className="bg-gray-900 p-3 rounded-md mb-4">
                            <p className="text-sm text-gray-300">
                                获取硅基流动API密钥：<a href="https://siliconflow.cn" target="_blank" className="text-blue-400 hover:underline">siliconflow.cn</a>
                            </p>
                            <p className="text-sm text-gray-300 mt-2">
                                获取Google AI Studio API密钥：<a href="https://aistudio.google.com" target="_blank" className="text-blue-400 hover:underline">aistudio.google.com</a>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                查看支持的模型列表：<a href="https://cloud.siliconflow.cn/me/models" target="_blank" className="text-blue-400 hover:underline">硅基流动模型列表</a>
                            </p>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowSettingsModal(false)}
                                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleSaveSettings}
                                disabled={!apiKey.trim()}
                                className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50"
                            >
                                保存设置
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatView;
