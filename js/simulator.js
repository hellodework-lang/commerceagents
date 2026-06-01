(function() {
  // Mock Client Message Simulator and sound synthesizer for premium UX
  // Uses window.DashboardState for shared state values

  // Self-contained Web Audio API Sound Synthesizer
  const playSynthSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'incoming') {
        // Soft WhatsApp-like ping sound (High pitch, fast decay)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'ai-start') {
        // Futuristic sweep sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'ai-success') {
        // Warm success double-chime (chords)
        [523.25, 659.25].forEach((freq, index) => { // C5 and E5
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.3);
          osc.start(ctx.currentTime + index * 0.1);
          osc.stop(ctx.currentTime + index * 0.1 + 0.35);
        });
      }
    } catch (e) {
      console.warn("Audio Context could not start:", e);
    }
  };

  function simulateIncomingMessage(templateIndex) {
    const { store, MOCK_TEMPLATES } = window.DashboardState;
    const template = MOCK_TEMPLATES[templateIndex];
    if (!template) return;

    const client = store.getState().clients.find(c => c.id === template.clientId);
    if (!client) return;

    // 1. Add the message to chat
    const now = new Date();
    let timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMessage = {
      sender: "client",
      text: template.userMessage,
      time: timeStr,
      type: template.msgType
    };

    if (template.msgType === 'image') {
      newMessage.text = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800";
      newMessage.caption = template.userMessage;
    }

    // Play ping sound
    playSynthSound('incoming');

    // Push message to chat history
    store.addMessage(client.phone, newMessage);

    // Set AI Generation state to active
    store.updateState({
      aiGenerationState: {
        isParsing: true,
        parsedText: "Listening & identifying language...",
        isGenerating: false,
        generatedPrompt: null,
        activeMessageId: Date.now()
      }
    });

    // Play scanning synthesizer sweep
    setTimeout(() => {
      playSynthSound('ai-start');
      store.updateState({
        aiGenerationState: {
          isParsing: true,
          parsedText: `Identified Language: ${template.language}. Extracting creative requirement: "${template.userMessage}"...`,
          isGenerating: true,
          generatedPrompt: null,
          activeMessageId: store.getState().aiGenerationState.activeMessageId
        }
      });
    }, 1200);

    // Final prompt delivery
    setTimeout(() => {
      const finalPrompt = {
        id: "prompt-" + Date.now(),
        date: now.toISOString().split('T')[0],
        category: template.category,
        userMessage: template.userMessage,
        generatedPrompt: template.generatedPrompt,
        projectTitle: template.projectTitle,
        promptCategory: template.promptCategory,
        status: "Pending Manual Production",
        media: template.msgType === 'image' ? newMessage.text : null
      };

      // Save generated prompt under client details and store
      store.updateClientPromptHistory(client.phone, finalPrompt);
      playSynthSound('ai-success');

      store.updateState({
        aiGenerationState: {
          isParsing: false,
          parsedText: "",
          isGenerating: false,
          generatedPrompt: finalPrompt,
          activeMessageId: null
        }
      });
    }, 3200);
  }

  // Export simulator globally
  window.DashboardSimulator = {
    simulateIncomingMessage,
    playSynthSound
  };
})();
