document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveKeyButton = document.getElementById('saveKey');
    const topicInput = document.getElementById('topic');
    const generateButton = document.getElementById('generate');
    const output = document.getElementById('output');
    const copyButton = document.getElementById('copyButton');
    const themeToggle = document.getElementById('themeToggle');
    const loading = document.getElementById('loading');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');

    // Load saved API key and theme
    apiKeyInput.value = localStorage.getItem('openRouterApiKey') || '';
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Save API key
    saveKeyButton.addEventListener('click', () => {
        localStorage.setItem('openRouterApiKey', apiKeyInput.value);
        alert('API key saved successfully!');
    });

    // Copy button
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(output.textContent)
            .then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            });
    });

    // Generate script
    generateButton.addEventListener('click', async () => {
        const apiKey = localStorage.getItem('openRouterApiKey');
        if (!apiKey) {
            alert('Please save your OpenRouter API key first!');
            return;
        }

        const topic = topicInput.value.trim();
        if (!topic) {
            alert('Please enter a topic!');
            return;
        }

        loading.style.display = 'flex';
        output.textContent = '';
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';

        // Start progress animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += 1;
                progressBar.style.width = `${progress}%`;
            }
        }, 200); // Slower progress to show longer generation time

        const hookTemplates = [
            "Penat tak dengan [masalah]?",
            "Pernah tertanya-tanya macam mana [orang capai hasil]?",
            "Ini rahsia tersembunyi untuk [hasil yang diingini].",
            "Ada rahsia tentang [topik] yang ramai tak tahu.",
            "Kalau saya cakap ada cara untuk [faedah spesifik], anda nak tahu?",
            "Selama ini anda buat [sesuatu] tak betul—ini cara betulnya!",
            "Tahukah anda boleh [capai matlamat] dalam masa [tempoh]?",
            "Ramai yang tak tahu petua ini tentang [topik].",
            "Bayangkan kalau anda boleh [hasil] tanpa [masalah biasa].",
            "Nak tahu cara paling mudah untuk [hasil yang diingini]?"
        ];

        const randomHook = hookTemplates[Math.floor(Math.random() * hookTemplates.length)];

        const prompt = `Write a script about ${topic} in Bahasa Malaysia for a 1-minute educational and informative video.

Guidelines:
The script will be read aloud, not displayed on screen.
Use a maximum of 120 words and maintain an extremely conversational tone with casual word choice.
Follow this format:
Hook: Use this specific hook line and adapt it to the topic:
"${randomHook}"

Peak interest: Highlight the results viewers can achieve by applying the solution.
Discuss the solution: Explain the idea or method.
How to apply it: Provide simple, actionable steps.
Call to action: Encourage viewers to take the next step.

Please format the output with clear spacing between sections and use appropriate Malay transition words.`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'AI Script Generator',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'google/learnlm-1.5-pro-experimental:free',
                    messages: [{
                        role: 'user',
                        content: [{
                            type: 'text',
                            text: prompt
                        }]
                    }]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                // Complete the progress bar
                progressBar.style.width = '100%';
                
                // Format the output with spacing
                const content = data.choices[0].message.content;
                const formattedContent = content
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .join('\n\n');
                output.textContent = formattedContent;
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        } finally {
            clearInterval(progressInterval);
            loading.style.display = 'none';
            // Hide progress bar after a short delay
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
            }, 500);
        }
    });
}); 