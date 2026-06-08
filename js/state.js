(function() {
  // Mock Database and Reactive State Management for the Dashboard

  const MOCK_CLIENTS = [
    {
      id: "nike-india",
      name: "Nike India",
      phone: "+91 98765 43210",
      avatar: `<div class="client-logo-avatar" style="background: #111; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"><svg viewBox="0 0 24 24" fill="#fff" style="width: 60%; height: 60%;"><path d="M21.055 3.32 C 19.344 4.887 15.344 8.785 11.238 12.39 C 9.388 14.015 7.152 15.535 5.094 16.316 C 4.098 16.695 3.129 16.89 2.215 16.89 C 1.23 16.89 0.707 16.484 0.707 15.72 C 0.707 14.281 2.133 11.082 4.496 6.89 C 4.906 6.16 5.371 5.992 5.727 6.332 C 5.922 6.516 5.977 6.85 5.867 7.277 C 5.586 8.355 5.176 9.871 4.707 11.277 C 4.566 11.699 4.863 11.895 5.254 11.84 C 6.559 11.66 8.738 10.742 11.285 9.07 C 14.887 6.707 18.734 3.75 20.355 2.5 C 20.762 2.188 21.055 2.367 21.055 2.87 C 21.055 2.996 21.055 3.125 21.055 3.32 Z"/></svg></div>`,
      guidelines: {
        brandColors: ["#E4002B", "#000000", "#FFFFFF"],
        brandFonts: ["Futura Bold", "Helvetica Neue"],
        brandTone: "Energetic, Bold, Inspiring, Athletic",
      },
      creativeDirection: "High-contrast photography, dynamic action shots, neon light trails, futuristic sportswear concepts, bold minimal overlays.",
      activeProjects: [
        { id: "proj-1", name: "Air Max Pulse launch", status: "In Production", category: "Poster Design", description: "Design high-energy promotional posters for the Air Max Pulse launch, incorporating bright red neon trails and motion-blurred runner silhouettes." },
        { id: "proj-2", name: "Monsoon Runners social", status: "Pending Approval", category: "Social Media Campaign", description: "Social campaign focused on urban running in heavy rain. Requirements: overcast mood, wet asphalt reflection, and vibrant overlay details." },
        { id: "proj-comp-1", name: "Pegasus 40 promotion", status: "Completed", category: "Poster Design", description: "Design promotional materials for Pegasus 40 launch." },
        { id: "proj-nike-3", name: "Pegasus Trail running campaign", status: "Completed", category: "Poster Design", description: "Design promotional materials for Pegasus Trail running shoes." },
        { id: "proj-nike-4", name: "Alphafly 3 launch event", status: "Completed", category: "Poster Design", description: "Marketing materials for the Alphafly 3 launch." }
      ],
      promptHistory: [
        {
          id: "ph-1",
          date: "2026-05-29",
          category: "Midjourney",
          userMessage: "Bro, Air Max poster dynamic runner speed lines glowing red venum",
          generatedPrompt: "Dynamic action shot of a professional runner wearing Nike Air Max, motion blur speed lines, glowing red neon trails, volumetric dark atmospheric lighting, high-contrast sports photography, 8k resolution, cinematic style --ar 16:9 --style raw",
          status: "Completed",
          mediaType: "image",
          media: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "ph-2",
          date: "2026-05-25",
          category: "Midjourney",
          userMessage: "Need a minimalist typography design for just do it with red highlight",
          generatedPrompt: "Minimalist black poster featuring high-end typography 'JUST DO IT', bold futuristic font, glowing crimson red underline accent, dark studio backdrop, soft cinematic backlighting, high-fashion branding mockup --ar 4:5",
          status: "Completed",
          mediaType: "image",
          media: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
        }
      ]
    },
    {
      id: "starbucks-tn",
      name: "Starbucks Tamil Nadu",
      phone: "+91 91234 56789",
      avatar: `<div class="client-logo-avatar" style="background: #00704A; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"><svg viewBox="0 0 100 100" fill="#fff" style="width: 65%; height: 65%;"><circle cx="50" cy="50" r="48" fill="#00704a"/><circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="4"/><path d="M50 32 L53 25 L50 22 L47 25 Z" fill="#fff"/><path d="M42 29 L45 26 L43 23 Z" fill="#fff"/><path d="M58 29 L55 26 L57 23 Z" fill="#fff"/><circle cx="50" cy="35" r="4" fill="#fff"/><path d="M50 40 C43 40 40 48 40 55 C40 62 48 68 50 68 C52 68 60 62 60 55 C60 48 57 40 50 40 Z" fill="#fff"/><circle cx="50" cy="48" r="8" fill="#00704a"/><circle cx="47" cy="46" r="1.5" fill="#fff"/><circle cx="53" cy="46" r="1.5" fill="#fff"/><path d="M48 51 Q50 53 52 51" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M22 50 L24 47 L21 45 L24 43 L22 40 L26 43 L29 40 L28 43 L31 45 L28 47 Z" fill="#fff"/><path d="M78 50 L76 47 L79 45 L76 43 L78 40 L74 43 L71 40 L72 43 L69 45 L72 47 Z" fill="#fff"/></svg></div>`,
      guidelines: {
        brandColors: ["#00704A", "#27251F", "#F2F0EB"],
        brandFonts: ["Sodo Sans", "Lander"],
        brandTone: "Warm, Welcoming, Premium, Sustainable",
      },
      creativeDirection: "Warm sunlight filters, cozy aesthetic setups, organic textures, elegant flatlays, minimalist typography, green-tinted shadows.",
      activeProjects: [
        { id: "proj-3", name: "Filter Coffee Fusion campaign", status: "In Production", category: "Social Media Banner", description: "Promoting South Indian Filter Coffee with warm wooden textures, cozy morning sunlight, scattered coffee beans, and traditional brass tumblers." },
        { id: "proj-comp-2", name: "Summer Drink campaign", status: "Completed", category: "Social Media Banner", description: "Completed social assets for summer season drinks." },
        { id: "proj-sb-3", name: "Frappuccino Fest 2026", status: "Completed", category: "Social Media Banner", description: "Campaign assets for the annual Frappuccino festival." }
      ],
      promptHistory: [
        {
          id: "ph-3",
          date: "2026-05-30",
          category: "Midjourney",
          userMessage: "Cozy morning filter coffee flatlay with traditional brass tumbler and coffee beans, warm sun rays style",
          generatedPrompt: "Top-down flatlay of a traditional South Indian brass tumbler filled with hot frothy filter coffee, scattered coffee beans, set on a dark rustic wooden table next to green banana leaves, warm golden hour sunlight casting soft long shadows, editorial food photography, cozy inviting vibe --ar 1:1 --stylize 250",
          status: "Completed",
          mediaType: "image",
          media: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "ph-3-audio",
          date: "2026-05-28",
          category: "Midjourney",
          userMessage: "Voice Note: check filter coffee details prompt update cozy traditional theme",
          generatedPrompt: "Aesthetic traditional South Indian kitchen window background, morning sunbeams, authentic brass coffee tumbler with rich brown filter coffee, cozy warm ambient lighting --ar 4:5",
          status: "Completed",
          mediaType: "audio",
          media: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          duration: "0:12"
        }
      ]
    },
    {
      id: "airtel-campaign",
      name: "Airtel Campaign",
      phone: "+91 88888 77777",
      avatar: `<div class="client-logo-avatar" style="background: #111; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border: 1px solid rgba(255,255,255,0.05);"><svg viewBox="0 0 100 100" fill="none" stroke="#ff2233" stroke-width="12" stroke-linecap="round" style="width: 55%; height: 55%;"><path d="M 30 70 C 30 50, 45 35, 60 35 C 75 35, 75 50, 75 60 C 75 70, 60 70, 50 70 C 40 70, 35 60, 35 50 C 35 30, 50 20, 70 20"/></svg></div>`,
      guidelines: {
        brandColors: ["#E4002B", "#000000", "#FFFFFF"],
        brandFonts: ["Airtel Sans", "Helvetica Neue"],
        brandTone: "Fast, Reliable, Energetic, Modern",
      },
      creativeDirection: "Dynamic light streaks, high-tech networks, neon red accents, seamless futuristic data streams, speed visual overlays.",
      activeProjects: [
        { id: "proj-airtel-1", name: "5G Plus Unlimited launch", status: "In Production", category: "Poster Design", description: "Launch promotions for Airtel 5G Plus unlimited plans in urban regions." },
        { id: "proj-airtel-2", name: "Airtel Black family plans", status: "Pending Approval", category: "Poster Design", description: "Promotional campaign showcasing unified family telecom plans." }
      ],
      promptHistory: [
        {
          id: "ph-airtel-1",
          date: "2026-05-31",
          category: "Midjourney",
          userMessage: "Airtel 5G speed light trails hyper detailed dark background",
          generatedPrompt: "Futuristic city skyline at night with high-speed light trails in red and white representing 5G connectivity, dark moody lighting, cinematic perspective, highly detailed --ar 16:9 --v 6.0",
          status: "Completed",
          mediaType: "image",
          media: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
        }
      ]
    },
    {
      id: "zomato-local",
      name: "Zomato Local",
      phone: "+91 77777 66666",
      avatar: `<div class="client-logo-avatar" style="background: #cb202d; font-family: 'Outfit', 'Inter', sans-serif; font-weight: 900; color: #fff; font-size: 0.6em; letter-spacing: -0.2px; text-transform: lowercase; user-select: none; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">zomato</div>`,
      guidelines: {
        brandColors: ["#E23744", "#2D2D2D", "#FFFFFF"],
        brandFonts: ["Metropolis", "System UI"],
        brandTone: "Friendly, Witty, Local, Mouthwatering",
      },
      creativeDirection: "Rich food closeups, melting cheese details, vibrant red backdrops, bold fun text tags, steam effects, street style mockups.",
      activeProjects: [
        { id: "proj-4", name: "Ghost Pepper Burger launch", status: "Pending Manual Production", category: "Poster Design", description: "Promote the ultra-spicy Ghost Pepper Cheese Burger. Focuses on macro cheese melting, dipping chili sauce, steam effects, and flashing retro neon signs." }
      ],
      promptHistory: [
        {
          id: "ph-4",
          date: "2026-05-31",
          category: "Midjourney",
          userMessage: "Ghost pepper cheese burger neon splash poster",
          generatedPrompt: "Ultra close-up macro shot of a massive gourmet burger with melting cheddar cheese, dipping hot red ghost pepper sauce, crispy bacon, steam rising, set against a dark brick wall background illuminated by flashing red and yellow neon signs, high-contrast food commercial photography, highly detailed texture --ar 4:5 --v 6.0",
          status: "Completed",
          mediaType: "image",
          media: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "ph-4-video",
          date: "2026-05-27",
          category: "Runway Gen-3",
          userMessage: "Video Note: melting cheese pouring sauce on hamburger loop",
          generatedPrompt: "Cinematic vertical video prompt: Slow-motion shot of warm melted cheddar cheese pouring over a premium grilled beef patty in a toasted sesame bun, close-up details, advertising style --ar 9:16 --v 6.0",
          status: "Completed",
          mediaType: "video",
          media: "https://assets.mixkit.co/videos/preview/mixkit-pouring-sauce-on-a-hamburger-40057-large.mp4"
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
      clientId: "airtel-campaign",
      userMessage: "Bro Airtel 5G campaign speed trails red neon",
      language: "Tanglish",
      msgType: "text",
      generatedPrompt: "Futuristic city skyline at night with high-speed light trails in red and white representing 5G connectivity, dark moody lighting, cinematic perspective, highly detailed --ar 16:9 --v 6.0",
      category: "Midjourney",
      projectTitle: "5G Plus Unlimited launch",
      promptCategory: "Creative Image Prompt"
    },
    {
      clientId: "zomato-local",
      userMessage: "Special weekend discount social media post, spicy chicken burger neon theme",
      language: "Tanglish",
      msgType: "text",
      generatedPrompt: "Eye-catching social media poster design featuring a crispy spicy chicken burger, neon red and yellow glowing typography saying 'SPICY WEEKEND', pop-art style halftone dots overlay, bold shadow outline, fast food menu layout --ar 1:1 --style raw",
      category: "Midjourney",
      projectTitle: "Weekend Spicy Special",
      promptCategory: "Creative Image Prompt"
    },
    {
      clientId: "zomato-local",
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
      { sender: "client", text: "Hi, Airtel Campaign assets ready. Moving to 5G launch soon.", time: "11:05 AM", type: "text" },
      { sender: "head", text: "Great, share the references so we can start generating prompts.", time: "11:07 AM", type: "text" },
      { sender: "client", text: "Airtel speedrun prompt ready pannunga, speed lines red overlay lines podunga.", time: "11:10 AM", type: "text" }
    ],
    "+91 77777 66666": [
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
        activeView: "dashboard", // dashboard, clients, media
        activeChatPhone: "+91 98765 43210",
        chats: JSON.parse(JSON.stringify(INITIAL_CHATS)), // deep copy initial chats
        recentPrompts: this.extractInitialPrompts(),
        unreadCounts: {
          "+91 98765 43210": 0,
          "+91 91234 56789": 0,
          "+91 88888 77777": 0,
          "+91 77777 66666": 0
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
            category: newPrompt.category,
            description: `Automated campaign brief generated from client request: "${newPrompt.userMessage}". Output style mapping targeted for ${newPrompt.category} production.`
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
      if (this.state.activeChatPhone !== phone || this.state.activeView !== "clients") {
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
