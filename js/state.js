(function() {
  // Mock Database and Reactive State Management for the Dashboard

  const MOCK_CLIENTS = [
    {
      id: "nike-india",
      name: "Nike India",
      phone: "+91 98765 43210",
      avatar: `<svg class="icon-svg" viewBox="0 0 24 24" style="stroke: #ff2233; width: 22px; height: 22px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      guidelines: {
        brandColors: ["#E4002B", "#000000", "#FFFFFF"],
        brandFonts: ["Futura Bold", "Helvetica Neue"],
        brandTone: "Energetic, Bold, Inspiring, Athletic",
      },
      creativeDirection: "High-contrast photography, dynamic action shots, neon light trails, futuristic sportswear concepts, bold minimal overlays.",
      activeProjects: [
        { id: "proj-1", name: "Air Max Pulse launch", status: "In Production", category: "Poster Design" },
        { id: "proj-2", name: "Monsoon Runners social", status: "Pending Approval", category: "Social Media Campaign" }
      ],
      promptHistory: [
        {
          id: "ph-1",
          date: "2026-05-29",
          category: "Midjourney",
          userMessage: "Bro, Air Max poster dynamic runner speed lines glowing red venum",
          generatedPrompt: "Dynamic action shot of a professional runner wearing Nike Air Max, motion blur speed lines, glowing red neon trails, volumetric dark atmospheric lighting, high-contrast sports photography, 8k resolution, cinematic style --ar 16:9 --style raw",
          status: "Completed",
          media: "https://images.unsplash.com/photo-1502904582529-2479b7ee5981?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "ph-2",
          date: "2026-05-25",
          category: "Midjourney",
          userMessage: "Need a minimalist typography design for just do it with red highlight",
          generatedPrompt: "Minimalist black poster featuring high-end typography 'JUST DO IT', bold futuristic font, glowing crimson red underline accent, dark studio backdrop, soft cinematic backlighting, high-fashion branding mockup --ar 4:5",
          status: "Completed",
          media: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
        }
      ]
    },
    {
      id: "starbucks-tn",
      name: "Starbucks Tamil Nadu",
      phone: "+91 91234 56789",
      avatar: `<svg class="icon-svg" viewBox="0 0 24 24" style="stroke: #2ecc71; width: 22px; height: 22px;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
      guidelines: {
        brandColors: ["#00704A", "#27251F", "#F2F0EB"],
        brandFonts: ["Sodo Sans", "Lander"],
        brandTone: "Warm, Welcoming, Premium, Sustainable",
      },
      creativeDirection: "Warm sunlight filters, cozy aesthetic setups, organic textures, elegant flatlays, minimalist typography, green-tinted shadows.",
      activeProjects: [
        { id: "proj-3", name: "Filter Coffee Fusion campaign", status: "In Production", category: "Social Media Banner" }
      ],
      promptHistory: [
        {
          id: "ph-3",
          date: "2026-05-30",
          category: "Midjourney",
          userMessage: "Cozy morning filter coffee flatlay with traditional brass tumbler and coffee beans, warm sun rays style",
          generatedPrompt: "Top-down flatlay of a traditional South Indian brass tumbler filled with hot frothy filter coffee, scattered coffee beans, set on a dark rustic wooden table next to green banana leaves, warm golden hour sunlight casting soft long shadows, editorial food photography, cozy inviting vibe --ar 1:1 --stylize 250",
          status: "Completed",
          media: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"
        }
      ]
    },
    {
      id: "local-burger",
      name: "The Local Burger Co.",
      phone: "+91 88888 77777",
      avatar: `<svg class="icon-svg" viewBox="0 0 24 24" style="stroke: #f1c40f; width: 22px; height: 22px;"><path d="M3 11h18a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2z"></path><path d="M12 2C6.48 2 2 6.48 2 12h20c0-5.52-4.48-10-10-10z"></path><path d="M2 14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3H2z"></path><path d="M4 18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2H4z"></path></svg>`,
      guidelines: {
        brandColors: ["#FFB000", "#D00000", "#1C1C1C"],
        brandFonts: ["Druk Bold", "Inter Black"],
        brandTone: "Bold, Funky, Edgy, Indulgent",
      },
      creativeDirection: "Saturated popping colors, close-up macro shots of melting cheese, retro pop-art style vectors, neon signage backgrounds, street-style poster design.",
      activeProjects: [
        { id: "proj-4", name: "Ghost Pepper Burger launch", status: "Pending Manual Production", category: "Poster Design" }
      ],
      promptHistory: [
        {
          id: "ph-4",
          date: "2026-05-31",
          category: "Midjourney",
          userMessage: "Ghost pepper cheese burger neon splash poster",
          generatedPrompt: "Ultra close-up macro shot of a massive gourmet burger with melting cheddar cheese, dipping hot red ghost pepper sauce, crispy bacon, steam rising, set against a dark brick wall background illuminated by flashing red and yellow neon signs, high-contrast food commercial photography, highly detailed texture --ar 4:5 --v 6.0",
          status: "Completed",
          media: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
        }
      ]
    }
  ];

  const MOCK_TEMPLATES = [
    {
      clientId: "nike-india",
      userMessage: "Bro futuristic black white AI poster venum",
      language: "Tanglish",
      msgType: "text",
      generatedPrompt: "Create a futuristic black-and-white AI poster with cinematic lighting, cyberpunk typography, premium contrast, and modern AI aesthetics, incorporating athletic silhouettes and metallic textures --ar 16:9 --style raw",
      category: "Midjourney",
      projectTitle: "AI Poster Run Campaign",
      promptCategory: "Creative Image Prompt"
    },
    {
      clientId: "nike-india",
      userMessage: "Air Max monsoon special campaign, dark background overlay with glowing red lighting lines",
      language: "Tanglish",
      msgType: "text",
      generatedPrompt: "High-end product commercial photography of Nike Air Max sneaker placed on wet asphalt, raindrops splashing, dramatic storm clouds, dark background overlay, bright neon red laser line accents highlighting the shoe sole, cinematic mood, 8k --ar 4:5 --v 6.0",
      category: "Midjourney",
      projectTitle: "Monsoon Activewear Campaign",
      promptCategory: "Creative Image Prompt"
    },
    {
      clientId: "nike-india",
      userMessage: "Bro monsoon runner poster prompt ready pannunga, speed lines neon red overlays podunga",
      language: "Tanglish (Voice Note)",
      msgType: "audio",
      mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration: "0:14",
      generatedPrompt: "Dynamic photography of a runner during heavy monsoon rainfall, wet roads reflecting glowing red laser speed lines, dramatic neon overlays, cinematic perspective, highly detailed sneaker details --ar 16:9 --style raw",
      category: "Midjourney",
      projectTitle: "Monsoon Speedrun Poster",
      promptCategory: "Creative Image Prompt"
    },
    {
      clientId: "starbucks-tn",
      userMessage: "Filter coffee fusion launching video loop, traditional aesthetics with modern sound wave, simple design",
      language: "English",
      msgType: "text",
      generatedPrompt: "Cinematic vertical video prompt: Slow-motion macro shot of milk pouring into a traditional brass filter coffee tumbler, creating beautiful frothy bubbles. Warm wooden textures, modern ambient glow, seamless looping layout, cozy hipster cafe aesthetic --ar 9:16 --v 6.0",
      category: "Runway Gen-3",
      projectTitle: "Traditional Filter Coffee Reel",
      promptCategory: "Video Motion Prompt"
    },
    {
      clientId: "starbucks-tn",
      userMessage: "நம்ம ஊரு பில்டர் காபி, ஒரு அருமையான தமிழ் போஸ்டர் டிசைன் வேணும், cozy background",
      language: "Tamil",
      msgType: "text",
      generatedPrompt: "Aesthetic promotional poster design showcasing traditional South Indian brass filter coffee tumbler. Background features a cozy vintage Tamil household kitchen window with morning sunlight, coconut trees visible outside, soft blur. Title typography placeholder in clean graphic style, rustic warm colors --ar 4:5",
      category: "Midjourney",
      projectTitle: "Namma Ooru Coffee Poster",
      promptCategory: "Creative Image Prompt"
    },
    {
      clientId: "starbucks-tn",
      userMessage: "Video reference context, filter coffee brewing action for landing video loop",
      language: "English (Video)",
      msgType: "video",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-coffee-maker-machine-brewing-coffee-40292-large.mp4",
      generatedPrompt: "Cozy vintage coffee shop setting, commercial close-up shot of rich filter coffee dripping through a traditional metal brewer into a brass cup, rising steam backlit by warm sunlight, warm earthy color palette --ar 9:16 --v 6.0",
      category: "Runway Gen-3",
      projectTitle: "Brewing Morning Video Loop",
      promptCategory: "Video Motion Prompt"
    },
    {
      clientId: "local-burger",
      userMessage: "Special weekend discount social media post, spicy chicken burger neon theme",
      language: "Tanglish",
      msgType: "text",
      generatedPrompt: "Eye-catching social media poster design featuring a crispy spicy chicken burger, neon red and yellow glowing typography saying 'SPICY WEEKEND', pop-art style halftone dots overlay, bold shadow outline, fast food menu layout --ar 1:1 --style raw",
      category: "Midjourney",
      projectTitle: "Weekend Spicy Special",
      promptCategory: "Creative Image Prompt"
    },
    {
      clientId: "local-burger",
      userMessage: "Cheesy burger close-up reference for pop-art poster design",
      language: "English (Image)",
      msgType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
      generatedPrompt: "Pop art illustration of a delicious cheeseburger with thick melting cheddar cheese, vibrant retro color scheme, halftone dot pattern overlay, thick cartoon outlines, bold energetic food commercial mockup --ar 1:1",
      category: "Midjourney",
      projectTitle: "Cheesy Pop Art Poster",
      promptCategory: "Creative Image Prompt"
    }
  ];

  const INITIAL_CHATS = {
    "+91 98765 43210": [
      { sender: "client", text: "Hi, Nike India creative head number correct ah?", time: "09:30 AM", type: "text" },
      { sender: "head", text: "Yes, this is Nike India Creative Ops team. How can we help you today?", time: "09:32 AM", type: "text" },
      { sender: "client", text: "New campaign details and reference photo anupuren.", time: "09:35 AM", type: "text" },
      { sender: "client", text: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", time: "09:36 AM", type: "image" },
      { sender: "client", text: "Intha theme base panni weekend poster prompt ready pannunga, glowing red outlines use pannalam.", time: "09:37 AM", type: "text" }
    ],
    "+91 91234 56789": [
      { sender: "client", text: "Morning bro! Filter coffee launch details ready.", time: "10:05 AM", type: "text" },
      { sender: "head", text: "Morning! Perfect. Share the raw requirements.", time: "10:07 AM", type: "text" },
      { sender: "client", text: "Voice note has requirements, please check.", time: "10:10 AM", type: "text" },
      { sender: "client", text: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", time: "10:10 AM", type: "audio", duration: "0:12" }
    ],
    "+91 88888 77777": [
      { sender: "client", text: "Bro, check this video mockup from last campaign.", time: "11:15 AM", type: "text" },
      { sender: "client", text: "https://assets.mixkit.co/videos/preview/mixkit-pouring-sauce-on-a-hamburger-40057-large.mp4", time: "11:16 AM", type: "video" },
      { sender: "client", text: "Weekend spicy special poster redesign venum, check template.", time: "11:18 AM", type: "text" }
    ]
  };

  // Application State Store
  class Store {
    constructor() {
      this.state = {
        clients: [...MOCK_CLIENTS],
        activeView: "dashboard", // dashboard, inbox, clients, media
        activeChatPhone: "+91 98765 43210",
        chats: JSON.parse(JSON.stringify(INITIAL_CHATS)), // deep copy initial chats
        recentPrompts: this.extractInitialPrompts(),
        unreadCounts: {
          "+91 98765 43210": 0,
          "+91 91234 56789": 0,
          "+91 88888 77777": 0
        },
        aiGenerationState: {
          isParsing: false,
          parsedText: "",
          isGenerating: false,
          generatedPrompt: null,
          activeMessageId: null
        }
      };
      this.listeners = [];
    }

    extractInitialPrompts() {
      const list = [];
      MOCK_CLIENTS.forEach(c => {
        c.promptHistory.forEach(ph => {
          list.push({
            ...ph,
            clientName: c.name,
            phone: c.phone
          });
        });
      });
      // Sort by date desc
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getState() {
      return this.state;
    }

    updateState(updatedFields) {
      this.state = { ...this.state, ...updatedFields };
      this.notifyListeners();
    }

    updateClientPromptHistory(phone, newPrompt) {
      const client = this.state.clients.find(c => c.phone === phone);
      if (client) {
        client.promptHistory.unshift(newPrompt);
        // Also update active project statuses
        const activeProj = client.activeProjects.find(p => p.category === newPrompt.category || p.name === newPrompt.projectTitle);
        if (!activeProj) {
          client.activeProjects.unshift({
            id: "proj-" + Date.now(),
            name: newPrompt.projectTitle || "New AI Prompt Project",
            status: "Pending Manual Production",
            category: newPrompt.category
          });
        } else {
          activeProj.status = "Pending Manual Production";
        }

        // Add to recent prompts list
        this.state.recentPrompts.unshift({
          ...newPrompt,
          clientName: client.name,
          phone: client.phone
        });
        this.notifyListeners();
      }
    }

    updateProjectStatus(phone, projectId, newStatus) {
      const client = this.state.clients.find(c => c.phone === phone);
      if (client) {
        const proj = client.activeProjects.find(p => p.id === projectId);
        if (proj) {
          proj.status = newStatus;
          this.notifyListeners();
        }
      }
    }

    addMessage(phone, msg) {
      if (!this.state.chats[phone]) {
        this.state.chats[phone] = [];
      }
      this.state.chats[phone].push(msg);

      // If it's not the active chat, increment unread count
      if (this.state.activeChatPhone !== phone || this.state.activeView !== "inbox") {
        this.state.unreadCounts[phone] = (this.state.unreadCounts[phone] || 0) + 1;
      }
      this.notifyListeners();
    }

    clearUnreads(phone) {
      if (this.state.unreadCounts[phone]) {
        this.state.unreadCounts[phone] = 0;
        this.notifyListeners();
      }
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    notifyListeners() {
      this.listeners.forEach(l => l(this.state));
    }
  }

  const store = new Store();

  // Export globals to window
  window.DashboardState = {
    MOCK_CLIENTS,
    MOCK_TEMPLATES,
    INITIAL_CHATS,
    store
  };
})();
