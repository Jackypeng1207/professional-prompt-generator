import React from 'react';
import ChatView from './components/ChatView';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
      <header className="w-full max-w-[90rem] mx-auto mb-4 text-center shrink-0">
        <div className="flex items-center justify-center gap-3">
          <SparklesIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            专业提示词生成器
          </h1>
        </div>
        <p className="mt-2 text-lg text-gray-400">
          与您的 AI 提示词副驾对话，共同打造完美指令
        </p>
      </header>
      <main className="w-full max-w-[90rem] mx-auto flex-grow min-h-0">
        <ChatView />
      </main>
    </div>
  );
};

export default App;
