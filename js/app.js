(function() {
  // Main Dashboard Controller, Router, and Template Renderer
  // Loaded globally without ES6 modules to support local file:// execution

  // Retrieve state and simulator objects from globals
  const { store, MOCK_TEMPLATES } = window.DashboardState;
  const { simulateIncomingMessage } = window.DashboardSimulator;

  // Elements Cache
  let el = {};

  function initElements() {
    el = {
      splash: document.getElementById('splash-screen'),
      navItems: document.querySelectorAll('.nav-item'),
      views: {
        dashboard: document.getElementById('view-dashboard'),
        inbox: document.getElementById('view-inbox'),
        clients: document.getElementById('view-clients'),
        media: document.getElementById('view-media')
      },
      // Inbox Panels
      chatList: document.getElementById('chat-list'),
      chatHeaderName: document.getElementById('chat-header-name'),
      chatHeaderPhone: document.getElementById('chat-header-phone'),
      chatHeaderAvatar: document.getElementById('chat-header-avatar'),
      chatFeed: document.getElementById('chat-feed'),
      clientProfileBrand: document.getElementById('client-profile-brand'),
      clientDirection: document.getElementById('client-direction'),
      aiPromptOutput: document.getElementById('ai-prompt-output'),
      
      // Dashboard Stats
      statCardClients: document.getElementById('stat-card-clients'),
      statCardPrompts: document.getElementById('stat-card-prompts'),
      statCardPending: document.getElementById('stat-card-pending'),
      statClientsCount: document.getElementById('stat-clients-count'),
      statPromptsCount: document.getElementById('stat-prompts-count'),
      statPendingTasks: document.getElementById('stat-pending-tasks'),
      dashboardRecentPrompts: document.getElementById('dashboard-recent-prompts'),
      
      // Clients List View
      clientsContainer: document.getElementById('clients-list-container'),
      clientDetailsPane: document.getElementById('client-details-pane'),
      
      // Media Vault
      mediaGrid: document.getElementById('media-grid'),
      
      // Simulator
      simulatorToggle: document.getElementById('simulator-toggle'),
      simulatorPanel: document.getElementById('simulator-panel'),
      simulatorClose: document.getElementById('simulator-close'),
      simulatorTemplates: document.getElementById('simulator-templates')
    };
  }

  // ----------------------------------------------------
  // UI Render Functions
  // ----------------------------------------------------

  function renderDashboard(state) {
    // Stats
    el.statClientsCount.textContent = state.clients.length;
    el.statPromptsCount.textContent = state.recentPrompts.length;
    
    // Pending Tasks Count
    let pendingCount = 0;
    state.clients.forEach(c => {
      pendingCount += c.activeProjects.filter(p => p.status === 'Pending Manual Production').length;
    });
    el.statPendingTasks.textContent = pendingCount;

    // Recent Prompt Table
    if (state.recentPrompts.length === 0) {
      el.dashboardRecentPrompts.innerHTML = `<tr><td colspan="5" class="empty-state">No prompts generated yet.</td></tr>`;
      return;
    }

    el.dashboardRecentPrompts.innerHTML = state.recentPrompts.map(p => `
      <tr class="recent-prompt-row" data-phone="${p.phone}" style="cursor: pointer;">
        <td>
          <div class="table-client">
            <span class="client-dot"></span>
            <div>
              <div class="name-bold">${p.clientName}</div>
              <div class="sub-phone">${p.phone}</div>
            </div>
          </div>
        </td>
        <td><span class="category-badge badge-${p.category.toLowerCase().replace(' ', '-')}">${p.category}</span></td>
        <td><div class="prompt-text-truncate" title="${p.generatedPrompt}">${p.generatedPrompt}</div></td>
        <td>
          <span class="status-badge status-${p.status.toLowerCase().replace(/\s+/g, '-')}">
            ${p.status}
          </span>
        </td>
        <td>
          <button class="action-btn copy-btn" data-prompt="${encodeURIComponent(p.generatedPrompt)}">
            <span class="btn-icon"><svg class="icon-svg" viewBox="0 0 24 24" style="width:12px; height:12px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg></span> Copy
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderInbox(state) {
    // 1. Render Left Chat List Sidebar
    el.chatList.innerHTML = state.clients.map(c => {
      const lastChats = state.chats[c.phone] || [];
      const lastMsg = lastChats[lastChats.length - 1];
      let msgPreview = "No messages";
      if (lastMsg) {
        msgPreview = lastMsg.type === 'text' ? lastMsg.text : `[${lastMsg.type.toUpperCase()} Attachment]`;
      }
      const isActive = state.activeChatPhone === c.phone ? 'active' : '';
      const unread = state.unreadCounts[c.phone] ? `<span class="unread-badge">${state.unreadCounts[c.phone]}</span>` : '';

      return `
        <div class="chat-list-card ${isActive}" data-phone="${c.phone}">
          <div class="chat-avatar">${c.avatar}</div>
          <div class="chat-card-info">
            <div class="chat-card-top">
              <span class="chat-card-name">${c.name}</span>
              <span class="chat-card-time">${lastMsg ? lastMsg.time : ''}</span>
            </div>
            <div class="chat-card-bottom">
              <span class="chat-card-preview">${msgPreview}</span>
              ${unread}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Get active client
    const activeClient = state.clients.find(c => c.phone === state.activeChatPhone);
    if (!activeClient) return;

    // 2. Render Chat Header
    el.chatHeaderName.textContent = activeClient.name;
    el.chatHeaderPhone.textContent = activeClient.phone;
    el.chatHeaderAvatar.innerHTML = activeClient.avatar;

    // 3. Render Chat Feed
    const chatMessages = state.chats[state.activeChatPhone] || [];
    if (chatMessages.length === 0) {
      el.chatFeed.innerHTML = `<div class="empty-state">No conversation history.</div>`;
    } else {
      el.chatFeed.innerHTML = chatMessages.map((msg, index) => {
        const isMe = msg.sender === 'head' ? 'msg-me' : 'msg-client';
        
        let body = '';
        if (msg.type === 'text') {
          body = `<p class="msg-text">${msg.text}</p>`;
        } else if (msg.type === 'image') {
          body = `
            <div class="msg-media-container">
              <img src="${msg.text}" alt="Reference image" class="msg-img-preview" />
              ${msg.caption ? `<p class="msg-caption">${msg.caption}</p>` : ''}
            </div>
          `;
        } else if (msg.type === 'video') {
          body = `
            <div class="msg-media-container">
              <video src="${msg.text}" controls class="msg-video-preview"></video>
              ${msg.caption ? `<p class="msg-caption">${msg.caption}</p>` : ''}
            </div>
          `;
        } else if (msg.type === 'audio') {
          body = `
            <div class="msg-audio-container" data-src="${msg.text}">
              <button class="audio-play-btn">▶</button>
              <div class="audio-wave">
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
              </div>
              <span class="audio-duration">${msg.duration || '0:12'}</span>
            </div>
          `;
        }

        return `
          <div class="chat-message ${isMe}" id="msg-${index}">
            <div class="msg-bubble">
              ${body}
              <span class="msg-time">${msg.time}</span>
            </div>
          </div>
        `;
      }).join('');
      
      // Scroll to bottom
      el.chatFeed.scrollTop = el.chatFeed.scrollHeight;
    }

    // 4. Render Right Panel: Brand Profile
    el.clientProfileBrand.innerHTML = `
      <div class="brand-swatch-container">
        ${activeClient.guidelines.brandColors.map(c => `
          <div class="brand-swatch" style="background-color: ${c}" title="${c}"></div>
        `).join('')}
      </div>
      <div class="brand-detail"><strong>Brand Fonts:</strong> ${activeClient.guidelines.brandFonts.join(', ')}</div>
      <div class="brand-detail"><strong>Tone:</strong> ${activeClient.guidelines.brandTone}</div>
    `;
    el.clientDirection.textContent = activeClient.creativeDirection;

    // 5. Render Right Panel: AI Generation Panel
    const ai = state.aiGenerationState;
    if (ai.isParsing) {
      el.aiPromptOutput.innerHTML = `
        <div class="ai-loader-container">
          <div class="glowing-spinner"></div>
          <div class="ai-loading-text">${ai.parsedText}</div>
        </div>
      `;
    } else if (ai.generatedPrompt) {
      const p = ai.generatedPrompt;
      el.aiPromptOutput.innerHTML = `
        <div class="ai-success-prompt animate-slide-up">
          <div class="prompt-meta">
            <span class="prompt-badge">${p.promptCategory}</span>
            <span class="engine-badge badge-${p.category.toLowerCase().replace(' ', '-')}">${p.category}</span>
          </div>
          <div class="prompt-box-text" id="active-prompt-text">${p.generatedPrompt}</div>
          <div class="prompt-actions">
            <button class="action-btn copy-btn primary-red-btn" data-prompt="${encodeURIComponent(p.generatedPrompt)}">
              <svg class="icon-svg" viewBox="0 0 24 24" style="width:14px; height:14px; margin-right:6px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> Copy Design Prompt
            </button>
            <span class="toast-indicator" id="copy-toast">Prompt Copied!</span>
          </div>
        </div>
      `;
    } else {
      // Show last prompt from history or waiting status
      const lastPrompt = activeClient.promptHistory[0];
      if (lastPrompt) {
        el.aiPromptOutput.innerHTML = `
          <div class="ai-history-prompt">
            <div class="prompt-meta">
              <span class="prompt-badge">${lastPrompt.promptCategory || 'AI Prompt'}</span>
              <span class="engine-badge badge-${lastPrompt.category.toLowerCase().replace(' ', '-')}">${lastPrompt.category}</span>
            </div>
            <div class="prompt-box-text" style="opacity: 0.85;">${lastPrompt.generatedPrompt}</div>
            <div class="prompt-actions">
              <button class="action-btn copy-btn primary-red-btn" data-prompt="${encodeURIComponent(lastPrompt.generatedPrompt)}">
                <svg class="icon-svg" viewBox="0 0 24 24" style="width:14px; height:14px; margin-right:6px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> Copy Design Prompt
              </button>
              <span class="toast-indicator" id="copy-toast">Prompt Copied!</span>
            </div>
            <div class="history-foot">Latest prompt generated on ${lastPrompt.date}</div>
          </div>
        `;
      } else {
        el.aiPromptOutput.innerHTML = `
          <div class="ai-waiting-state">
            <span class="waiting-icon"><svg class="icon-svg" viewBox="0 0 24 24" style="width:48px; height:48px; stroke: var(--text-dim); opacity:0.35;"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="8" cy="16" r="1"></circle><circle cx="16" cy="16" r="1"></circle><path d="M9 2h6"></path><path d="M12 2v9"></path><path d="M2 14h1"></path><path d="M21 14h1"></path></svg></span>
            <p>Waiting for incoming client requirements...</p>
          </div>
        `;
      }
    }
  }

  function renderClients(state) {
    // Render Left Side List
    el.clientsContainer.innerHTML = state.clients.map((c, index) => {
      const isActive = state.activeChatPhone === c.phone ? 'active' : '';
      return `
        <div class="client-profile-row ${isActive}" data-index="${index}">
          <div class="client-avatar">${c.avatar}</div>
          <div class="client-row-info">
            <div class="client-row-name">${c.name}</div>
            <div class="client-row-phone">${c.phone}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderClientDetails(client) {
    if (!client) {
      el.clientDetailsPane.innerHTML = `<div class="empty-state">Select a client to view details</div>`;
      return;
    }

    el.clientDetailsPane.innerHTML = `
      <div class="client-details-header">
        <div class="details-avatar">${client.avatar}</div>
        <div>
          <h2>${client.name}</h2>
          <p class="sub-phone">${client.phone}</p>
        </div>
      </div>
      
      <div class="details-grid">
        <div class="details-card glass-panel">
          <h3>🎨 Brand Guidelines</h3>
          <div class="brand-swatch-container" style="margin: 15px 0;">
            ${client.guidelines.brandColors.map(c => `
              <div class="brand-swatch large" style="background-color: ${c}" title="${c}"></div>
            `).join('')}
          </div>
          <p><strong>Primary Palette:</strong> ${client.guidelines.brandColors.join(', ')}</p>
          <p><strong>Brand Fonts:</strong> ${client.guidelines.brandFonts.join(', ')}</p>
          <p><strong>Tone of Voice:</strong> ${client.guidelines.brandTone}</p>
        </div>
        
        <div class="details-card glass-panel">
          <h3>🚀 Creative Direction</h3>
          <p style="line-height: 1.6; opacity: 0.9;">${client.creativeDirection}</p>
        </div>
      </div>

      <div class="details-section">
        <h3>Active Projects</h3>
        <div class="projects-table-wrapper">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${client.activeProjects.map(p => `
                <tr>
                  <td class="name-bold">${p.name}</td>
                  <td>${p.category}</td>
                  <td>
                    <span class="status-badge status-${p.status.toLowerCase().replace(/\s+/g, '-')}">
                      ${p.status}
                    </span>
                  </td>
                  <td>
                    <select class="status-select-action" data-client-phone="${client.phone}" data-project-id="${p.id}">
                      <option value="Pending Manual Production" ${p.status === 'Pending Manual Production' ? 'selected' : ''}>Pending Production</option>
                      <option value="In Production" ${p.status === 'In Production' ? 'selected' : ''}>In Production</option>
                      <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="details-section">
        <h3>Prompt History</h3>
        <div class="prompt-history-cards">
          ${client.promptHistory.map(ph => `
            <div class="prompt-history-card glass-panel">
              <div class="history-card-header">
                <span class="category-badge badge-${ph.category.toLowerCase().replace(' ', '-')}">${ph.category}</span>
                <span class="history-card-date">${ph.date}</span>
              </div>
              <div class="history-card-msg"><strong>Client Requirement:</strong> "${ph.userMessage}"</div>
              <div class="history-card-prompt"><strong>Prompt:</strong> ${ph.generatedPrompt}</div>
              <div class="history-card-actions">
                <button class="action-btn copy-btn primary-red-btn" data-prompt="${encodeURIComponent(ph.generatedPrompt)}">
                  <svg class="icon-svg" viewBox="0 0 24 24" style="width:14px; height:14px; margin-right:6px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> Copy Prompt
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Attach status change events
    el.clientDetailsPane.querySelectorAll('.status-select-action').forEach(select => {
      select.addEventListener('change', (e) => {
        const phone = e.target.getAttribute('data-client-phone');
        const projId = e.target.getAttribute('data-project-id');
        const newStatus = e.target.value;
        store.updateProjectStatus(phone, projId, newStatus);
      });
    });
  }

  function renderMediaVault(state) {
    // Aggregate all prompts with media attachments
    const mediaItems = [];
    state.clients.forEach(c => {
      c.promptHistory.forEach(ph => {
        if (ph.media) {
          mediaItems.push({
            url: ph.media,
            clientName: c.name,
            date: ph.date,
            prompt: ph.generatedPrompt
          });
        }
      });
      // Add images sent in the chat feeds
      const chats = state.chats[c.phone] || [];
      chats.forEach(msg => {
        if (msg.type === 'image') {
          mediaItems.push({
            url: msg.text,
            clientName: c.name,
            date: 'Chat History',
            prompt: msg.caption || 'Reference Attachment'
          });
        }
      });
    });

    if (mediaItems.length === 0) {
      el.mediaGrid.innerHTML = `<div class="empty-state">No media attachments found.</div>`;
      return;
    }

    el.mediaGrid.innerHTML = mediaItems.map(m => `
      <div class="media-card glass-panel animate-zoom-in">
        <img src="${m.url}" alt="Attachment from ${m.clientName}" class="media-card-img" />
        <div class="media-card-overlay">
          <h4>${m.clientName}</h4>
          <p class="media-date">${m.date}</p>
          <p class="media-prompt-ref">${m.prompt}</p>
          <button class="action-btn copy-btn media-copy-btn" data-prompt="${encodeURIComponent(m.prompt)}">
            <svg class="icon-svg" viewBox="0 0 24 24" style="width:12px; height:12px; margin-right:4px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> Copy Associated Prompt
          </button>
        </div>
      </div>
    `).join('');
  }

  // ----------------------------------------------------
  // Navigation / Routing
  // ----------------------------------------------------

  function handleViewSwitch(viewName) {
    // Update state
    store.updateState({ activeView: viewName });
  }

  function updateActiveViewUI(activeView) {
    // Navigation active states
    el.navItems.forEach(btn => {
      if (btn.getAttribute('data-view') === activeView) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Hide/Show screens
    Object.keys(el.views).forEach(key => {
      if (key === activeView) {
        el.views[key].classList.add('active');
      } else {
        el.views[key].classList.remove('active');
      }
    });
  }

  // ----------------------------------------------------
  // Sound Player and Synthesizer Controls
  // ----------------------------------------------------

  function setupAudioPlayerEvents() {
    document.addEventListener('click', (e) => {
      const playBtn = e.target.closest('.audio-play-btn');
      if (playBtn) {
        const container = playBtn.closest('.msg-audio-container');
        const wave = container.querySelector('.audio-wave');
        
        if (playBtn.classList.contains('playing')) {
          playBtn.classList.remove('playing');
          playBtn.textContent = '▶';
          wave.classList.remove('animating');
        } else {
          // Stop all other playing audios
          document.querySelectorAll('.audio-play-btn.playing').forEach(btn => {
            btn.classList.remove('playing');
            btn.textContent = '▶';
            const w = btn.closest('.msg-audio-container').querySelector('.audio-wave');
            if (w) w.classList.remove('animating');
          });
          
          playBtn.classList.add('playing');
          playBtn.textContent = '⏸';
          wave.classList.add('animating');

          // Mock sound playback using basic beep or just visual timer
          setTimeout(() => {
            if (playBtn.classList.contains('playing')) {
              playBtn.classList.remove('playing');
              playBtn.textContent = '▶';
              wave.classList.remove('animating');
            }
          }, 12000);
        }
      }
    });
  }

  // ----------------------------------------------------
  // Global Event Attachments
  // ----------------------------------------------------

  function attachGlobalListeners() {
    // Navigation clicks
    el.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        handleViewSwitch(view);
      });
    });

    // Stats cards click navigation
    if (el.statCardClients) {
      el.statCardClients.addEventListener('click', () => {
        handleViewSwitch('clients');
      });
    }
    if (el.statCardPrompts) {
      el.statCardPrompts.addEventListener('click', () => {
        handleViewSwitch('inbox');
      });
    }
    if (el.statCardPending) {
      el.statCardPending.addEventListener('click', () => {
        handleViewSwitch('clients');
      });
    }

    // Chat select clicks
    el.chatList.addEventListener('click', (e) => {
      const card = e.target.closest('.chat-list-card');
      if (card) {
        const phone = card.getAttribute('data-phone');
        store.updateState({ activeChatPhone: phone });
        store.clearUnreads(phone);
      }
    });

    // Recent prompt row click navigation
    if (el.dashboardRecentPrompts) {
      el.dashboardRecentPrompts.addEventListener('click', (e) => {
        if (e.target.closest('.copy-btn')) return;
        const row = e.target.closest('.recent-prompt-row');
        if (row) {
          const phone = row.getAttribute('data-phone');
          store.updateState({
            activeView: 'inbox',
            activeChatPhone: phone
          });
          store.clearUnreads(phone);
        }
      });
    }

    // Client list select clicks
    el.clientsContainer.addEventListener('click', (e) => {
      const row = e.target.closest('.client-profile-row');
      if (row) {
        const index = parseInt(row.getAttribute('data-index'), 10);
        const client = store.getState().clients[index];
        store.updateState({ activeChatPhone: client.phone });
      }
    });

    // Clipboard Copier Handler
    document.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.copy-btn');
      if (copyBtn) {
        const text = decodeURIComponent(copyBtn.getAttribute('data-prompt'));
        navigator.clipboard.writeText(text).then(() => {
          // Show indicator toast if exists
          const toast = document.getElementById('copy-toast');
          if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
          } else {
            // Floating overlay feedback
            const rect = copyBtn.getBoundingClientRect();
            const feedback = document.createElement('div');
            feedback.className = 'toast-feedback';
            feedback.textContent = 'Copied!';
            feedback.style.left = `${rect.left + window.scrollX + (rect.width/2) - 30}px`;
            feedback.style.top = `${rect.top + window.scrollY - 35}px`;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 1200);
          }
        });
      }
    });

    // Simulator Drawer Trigger
    el.simulatorToggle.addEventListener('click', () => {
      el.simulatorPanel.classList.add('open');
    });

    el.simulatorClose.addEventListener('click', () => {
      el.simulatorPanel.classList.remove('open');
    });

    // Simulator Template Click Trigger
    el.simulatorTemplates.addEventListener('click', (e) => {
      const triggerBtn = e.target.closest('.sim-trigger-btn');
      if (triggerBtn) {
        const idx = parseInt(triggerBtn.getAttribute('data-index'), 10);
        // Auto-switch to inbox view and client chat so they see it happen
        const template = MOCK_TEMPLATES[idx];
        const client = store.getState().clients.find(c => c.id === template.clientId);
        
        store.updateState({
          activeView: 'inbox',
          activeChatPhone: client.phone
        });
        store.clearUnreads(client.phone);
        
        // Trigger message flow simulation
        simulateIncomingMessage(idx);
        el.simulatorPanel.classList.remove('open');
      }
    });
  }

  // ----------------------------------------------------
  // Simulator Setup
  // ----------------------------------------------------

  function setupSimulatorControls() {
    el.simulatorTemplates.innerHTML = MOCK_TEMPLATES.map((t, idx) => {
      const client = store.getState().clients.find(c => c.id === t.clientId);
      return `
        <div class="simulator-card glass-panel">
          <div class="sim-header">
            <span class="sim-client">${client ? client.name : 'Unknown'}</span>
            <span class="sim-lang">${t.language}</span>
          </div>
          <div class="sim-body">"${t.userMessage}"</div>
          <button class="sim-trigger-btn primary-red-btn" data-index="${idx}">
            Simulate Message Send
          </button>
        </div>
      `;
    }).join('');
  }

  // ----------------------------------------------------
  // Initial Loading Splash Sequence
  // ----------------------------------------------------

  function startSplashSequence() {
    // Fade out splash after delay
    setTimeout(() => {
      el.splash.classList.add('fade-out');
      setTimeout(() => {
        el.splash.style.display = 'none';
      }, 600);
    }, 2400);
  }

  // ----------------------------------------------------
  // Initialization Entrypoint
  // ----------------------------------------------------

  function startApp() {
    initElements();
    
    // Set initial client in clients database detail pane
    if (store.getState().clients.length > 0) {
      const activePhone = store.getState().activeChatPhone;
      const initialClient = store.getState().clients.find(c => c.phone === activePhone) || store.getState().clients[0];
      renderClientDetails(initialClient);
    }

    // Subscribe UI Renderers to State Changes
    store.subscribe((state) => {
      updateActiveViewUI(state.activeView);
      
      if (state.activeView === 'dashboard') {
        renderDashboard(state);
      } else if (state.activeView === 'inbox') {
        renderInbox(state);
      } else if (state.activeView === 'clients') {
        renderClients(state);
        const activeClient = state.clients.find(c => c.phone === state.activeChatPhone) || state.clients[0];
        renderClientDetails(activeClient);
      } else if (state.activeView === 'media') {
        renderMediaVault(state);
      }
    });

    // Attach global actions & event loops
    attachGlobalListeners();
    setupAudioPlayerEvents();
    setupSimulatorControls();

    // Trigger initial dashboard rendering
    renderDashboard(store.getState());

    // Start initialization splash screen
    startSplashSequence();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startApp();
  } else {
    window.addEventListener('DOMContentLoaded', startApp);
  }
})();
