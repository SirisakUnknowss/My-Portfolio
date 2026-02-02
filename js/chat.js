
document.addEventListener('DOMContentLoaded', () => {
    const chatWidget = document.createElement('div');
    chatWidget.innerHTML = `
        <!-- Floating Chat Button -->
        <button id="chat-toggle" class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50">
            💬
        </button>

        <!-- Chat Window -->
        <div id="chat-window" class="fixed bottom-24 right-6 w-96 h-[500px] bg-[#0a0a0f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col hidden z-50 overflow-hidden transform transition-all duration-300 origin-bottom-right scale-95 opacity-0">
            <!-- Header -->
            <div class="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">AI</div>
                    <div>
                        <h3 class="font-semibold text-sm text-white">Unknowss AI</h3>
                        <p class="text-xs text-green-400">● Online</p>
                    </div>
                </div>
                <button id="chat-close" class="text-slate-400 hover:text-white">
                    ✖️
                </button>
            </div>

            <!-- Messages -->
            <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
                <div class="flex gap-3">
                    <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 mt-1"></div>
                    <div class="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-200">
                        Hello! I'm the AI assistant for Unknowss. Ask me anything about his skills, projects, or how to get in touch!
                    </div>
                </div>
            </div>

            <!-- Input -->
            <div class="p-4 border-t border-slate-800 bg-slate-900/50">
                <form id="chat-form" class="flex gap-2">
                    <input type="text" id="chat-input" placeholder="Ask something..." class="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" autocomplete="off">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50">
                        ➤
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(chatWidget);

    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');

    let isOpen = false;

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            chatWindow.classList.remove('hidden');
            setTimeout(() => {
                chatWindow.classList.remove('scale-95', 'opacity-0');
            }, 10);
            chatInput.focus();
        } else {
            chatWindow.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                chatWindow.classList.add('hidden');
            }, 300);
        }
    }

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    function addMessage(text, isUser = false) {
        const div = document.createElement('div');
        div.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''} fade-in`;

        const avatar = isUser
            ? `<div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">👤</div>`
            : `<div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 mt-1"></div>`;

        const bubble = `<div class="${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-200'} p-3 rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} text-sm max-w-[80%]">
            ${text}
        </div>`;

        div.innerHTML = isUser ? bubble + avatar : avatar + bubble;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addLoading() {
        const div = document.createElement('div');
        div.id = 'chat-loading';
        div.className = 'flex gap-3 fade-in';
        div.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 mt-1"></div>
            <div class="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-200 flex gap-1 items-center h-10">
                <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
        `;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeLoading() {
        const loading = document.getElementById('chat-loading');
        if (loading) loading.remove();
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        chatInput.value = '';
        addLoading();

        try {
            // Note: In production Vercel, this hits /api/chat. 
            // In local static file, this will 404 unless we mock it or run vercel dev.
            // I'll add a check for local dev environment to mock response if needed.

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            removeLoading();

            if (data.reply) {
                addMessage(data.reply);
            } else {
                addMessage("I'm having trouble connecting to the server right now. Please try again later.");
            }
        } catch (error) {
            removeLoading();
            console.error(error);
            // Mock response for demo purposes if API fails (likely in static local view)
            setTimeout(() => {
                addMessage("⚠️ **Demo Mode**: Backend not connected. \n\n(To make this work real-time, deploy this repo to Vercel and set your GEMINI_API_KEY).");
            }, 500);
        }
    });
});
