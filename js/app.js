(function() {
  // Main Dashboard Controller, Router, and Template Renderer
  // Loaded globally without ES6 modules to support local file:// execution

  // Retrieve state and simulator objects from globals
  const { store: appStore, MOCK_TEMPLATES } = window.DashboardState;
  const { simulateIncomingMessage } = window.DashboardSimulator;

  // Elements Cache
  let el = {};

  function initElements() {
    el = {
      splash: document.getElementById('splash-screen'),
      navItems: document.querySelectorAll('.nav-item'),
      views: {
        dashboard: document.getElementById('view-dashboard'),
        clients: document.getElementById('view-clients'),
        media: document.getElementById('view-media'),
        status: document.getElementById('view-status')
      },
      
      // Dashboard Stats
      statCardClients: document.getElementById('stat-card-clients'),
      statCardPrompts: document.getElementById('stat-card-prompts'),
      statCardPending: document.getElementById('stat-card-pending'),
      statClientsCount: document.getElementById('stat-clients-count'),
      statPromptsCount: document.getElementById('stat-prompts-count'),
      statPendingTasks: document.getElementById('stat-pending-tasks'),
      
      // Clients Directory 4-Column Layout
      clientDbFilterDropdown: document.getElementById('client-db-filter-dropdown'),
      customDropdownSelectedName: document.getElementById('custom-dropdown-selected-name'),
      customDropdownOptionsList: document.getElementById('custom-dropdown-options-list'),
      toggleSidebarBtn: document.getElementById('toggle-sidebar-btn'),
      clientColMessages: document.getElementById('client-col-messages'),
      clientColGuidelines: document.getElementById('client-col-guidelines'),
      clientColProjects: document.getElementById('client-col-projects'),
      clientColPromptHistory: document.getElementById('client-col-prompt-history'),
      
      // Media Vault
      mediaGrid: document.getElementById('media-grid'),
      
      // Status Board Columns & Counters
      colPending: document.getElementById('cards-pending'),
      colApproval: document.getElementById('cards-approval'),
      colProgress: document.getElementById('cards-progress'),
      colCompleted: document.getElementById('cards-completed'),
      countPending: document.getElementById('count-pending'),
      countApproval: document.getElementById('count-approval'),
      countProgress: document.getElementById('count-progress'),
      countCompleted: document.getElementById('count-completed'),
      
      // Simulator
      simulatorToggle: document.getElementById('simulator-toggle'),
      simulatorPanel: document.getElementById('simulator-panel'),
      simulatorClose: document.getElementById('simulator-close'),
      simulatorTemplates: document.getElementById('simulator-templates')
    };
  }

  // Helper to find the live project status for a prompt/media item
  function getLiveProjectStatus(clientPhone, promptItem) {
    const state = appStore.getState();
    const client = state.clients.find(c => c.phone === clientPhone);
    if (!client) return promptItem.status || 'Completed';

    let project = null;
    if (promptItem.projectTitle) {
      project = client.activeProjects.find(p => p.name === promptItem.projectTitle);
    }
    if (!project) {
      // Fallback lookup for mock data
      const id = promptItem.id;
      if (id === 'ph-1') project = client.activeProjects.find(p => p.id === 'proj-1');
      else if (id === 'ph-2') project = client.activeProjects.find(p => p.id === 'proj-2');
      else if (id === 'ph-3' || id === 'ph-3-audio') project = client.activeProjects.find(p => p.id === 'proj-3');
      else if (id === 'ph-4' || id === 'ph-4-video') project = client.activeProjects.find(p => p.id === 'proj-4');
    }

    if (project) {
      return project.status;
    }
    return promptItem.status || 'Completed';
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

    // Calculate Project status split for Company Overview
    let totalProjects = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingApprovalCount = 0;
    let pendingProductionCount = 0;

    state.clients.forEach(c => {
      c.activeProjects.forEach(p => {
        totalProjects++;
        if (p.status === 'Completed') {
          completedCount++;
        } else if (p.status === 'In Production') {
          inProgressCount++;
        } else if (p.status === 'Pending Approval') {
          pendingApprovalCount++;
        } else {
          pendingProductionCount++;
        }
      });
    });

    const total = totalProjects || 1; // prevent division by zero
    const pctCompleted = Math.round((completedCount / total) * 100);
    const pctProgress = Math.round((inProgressCount / total) * 100);
    const pctApproval = Math.round((pendingApprovalCount / total) * 100);
    const pctPending = 100 - pctCompleted - pctProgress - pctApproval;

    // Update Donut Chart DOM elements
    const projectsRing = document.getElementById('donut-projects-ring');
    const projectsVal = document.getElementById('donut-projects-val');
    const companiesVal = document.getElementById('donut-companies-val');
    const completedVal = document.getElementById('donut-completed-val');
    const completedPct = document.getElementById('donut-completed-pct');
    const productionVal = document.getElementById('donut-production-val');
    const productionPct = document.getElementById('donut-production-pct');
    const approvalVal = document.getElementById('donut-approval-val');
    const approvalPct = document.getElementById('donut-approval-pct');
    const pendingVal = document.getElementById('donut-pending-val');
    const pendingPct = document.getElementById('donut-pending-pct');

    if (projectsVal) projectsVal.textContent = totalProjects;
    if (companiesVal) companiesVal.textContent = state.clients.length;
    if (completedVal) completedVal.textContent = completedCount;
    if (completedPct) completedPct.textContent = `(${pctCompleted}%)`;
    if (productionVal) productionVal.textContent = inProgressCount;
    if (productionPct) productionPct.textContent = `(${pctProgress}%)`;
    if (approvalVal) approvalVal.textContent = pendingApprovalCount;
    if (approvalPct) approvalPct.textContent = `(${pctApproval}%)`;
    if (pendingVal) pendingVal.textContent = pendingProductionCount;
    if (pendingPct) pendingPct.textContent = `(${pctPending}%)`;

    // Conic gradient background rendering:
    // Completed (Green): #2ecc71
    // In Production (Blue): #3498db
    // Pending Approval (Purple): #9034ff
    // Pending Production (Red): var(--accent-red)
    if (projectsRing) {
      const stop1 = pctCompleted;
      const stop2 = stop1 + pctProgress;
      const stop3 = stop2 + pctApproval;
      projectsRing.style.background = `conic-gradient(
        #2ecc71 0% ${stop1}%,
        #3498db ${stop1}% ${stop2}%,
        #9034ff ${stop2}% ${stop3}%,
        var(--accent-red) ${stop3}% 100%
      )`;
    }
  }



  function renderClients(state) {
    if (el.clientDbFilterDropdown && el.customDropdownOptionsList && el.customDropdownSelectedName) {
      const activeClient = state.clients.find(c => c.phone === state.activeChatPhone);
      if (activeClient) {
        el.customDropdownSelectedName.textContent = activeClient.name;
      } else {
        el.customDropdownSelectedName.textContent = "Select Client";
      }

      el.customDropdownOptionsList.innerHTML = state.clients.map(c => `
        <div class="custom-dropdown-option ${state.activeChatPhone === c.phone ? 'selected' : ''}" data-value="${c.phone}">
          ${c.name}
        </div>
      `).join('');
    }
  }

  function renderClientDetails(client) {
    if (!client) {
      el.clientColMessages.innerHTML = `<div class="empty-state">Select a client</div>`;
      el.clientColGuidelines.innerHTML = ``;
      el.clientColProjects.innerHTML = ``;
      el.clientColPromptHistory.innerHTML = ``;
      return;
    }

    // ----------------------------------------------------
    // COLUMN 1: Client Messages (Chat Feed)
    // ----------------------------------------------------
    const chatMessages = appStore.getState().chats[client.phone] || [];
    let chatFeedHtml = '';
    if (chatMessages.length === 0) {
      chatFeedHtml = `<div class="empty-state">No conversation history.</div>`;
    } else {
      chatFeedHtml = chatMessages.map((msg, index) => {
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
          <div class="chat-message ${isMe}" id="client-db-msg-${index}" style="max-width: 90%; margin-bottom: 12px;">
            <div class="msg-bubble" style="padding: 10px 14px;">
              ${body}
              <span class="msg-time">${msg.time}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    el.clientColMessages.innerHTML = `
      <div class="panel-header" style="padding-bottom: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px;">
        <div class="chat-avatar" style="width: 36px; height: 36px; font-size: 16px;">${client.avatar}</div>
        <div>
          <h3 style="font-size: 14px; font-weight: 700; margin: 0;">${client.name}</h3>
          <span class="sub-phone" style="font-size: 11px;">${client.phone}</span>
        </div>
      </div>
      <div class="chat-window-feed" style="height: calc(100% - 65px); overflow-y: auto; display: flex; flex-direction: column; padding: 5px; background: transparent;">
        ${chatFeedHtml}
      </div>
    `;

    // Auto scroll chat to bottom
    const messagesFeed = el.clientColMessages.querySelector('.chat-window-feed');
    if (messagesFeed) {
      messagesFeed.scrollTop = messagesFeed.scrollHeight;
    }

    // ----------------------------------------------------
    // COLUMN 2: Brand Guidelines
    // ----------------------------------------------------
    el.clientColGuidelines.innerHTML = `
      <div class="panel-header" style="padding-bottom: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
        <h3 style="font-size: 14px; font-weight: 700; margin: 0; color: var(--accent-red); text-transform: uppercase; letter-spacing: 0.5px;">🎨 Brand Profile</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px; height: calc(100% - 45px); overflow-y: auto; padding-right: 5px;">
        <div class="details-card glass-panel" style="padding: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--text-main);">Brand Palette</h4>
          <div class="brand-swatch-container" style="margin: 10px 0; display: flex; gap: 6px;">
            ${client.guidelines.brandColors.map(c => `
              <div class="brand-swatch large" style="background-color: ${c}; width: 30px; height: 30px; border-radius: 4px;" title="${c}"></div>
            `).join('')}
          </div>
          <p style="font-size: 12px; color: var(--text-muted);"><strong>Fonts:</strong> ${client.guidelines.brandFonts.join(', ')}</p>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;"><strong>Tone:</strong> ${client.guidelines.brandTone}</p>
        </div>
        
        <div class="details-card glass-panel" style="padding: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--text-main);">Creative Direction</h4>
          <p style="font-size: 12px; line-height: 1.6; opacity: 0.9; color: var(--text-muted);">${client.creativeDirection}</p>
        </div>
      </div>
    `;

    // ----------------------------------------------------
    // COLUMN 3: Active Projects
    // ----------------------------------------------------
    const projectsHtml = client.activeProjects.map(p => `
      <div class="details-card glass-panel" style="padding: 14px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border-subtle);">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
          <span style="font-weight: 600; font-size: 13px; color: var(--text-main);">${p.name}</span>
          <span class="category-badge badge-${p.category.toLowerCase().replace(' ', '-').replace(/\s+/g, '-')}" style="font-size: 10px; padding: 2px 6px;">${p.category}</span>
        </div>
        <!-- Project Explanation / Brief Description -->
        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 4px 0;">
          <strong>Brief:</strong> ${p.description || 'No description brief available for this project.'}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
          <span class="status-badge status-${p.status.toLowerCase().replace(/\s+/g, '-')}" style="font-size: 10px; padding: 2px 6px;">${p.status}</span>
          <select class="status-select-action" data-client-phone="${client.phone}" data-project-id="${p.id}" style="padding: 2px 6px; font-size: 11px;">
            <option value="Pending Manual Production" ${p.status === 'Pending Manual Production' ? 'selected' : ''}>Pending</option>
            <option value="In Production" ${p.status === 'In Production' ? 'selected' : ''}>Production</option>
            <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
    `).join('');

    el.clientColProjects.innerHTML = `
      <div class="panel-header" style="padding-bottom: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
        <h3 style="font-size: 14px; font-weight: 700; margin: 0; color: var(--accent-red); text-transform: uppercase; letter-spacing: 0.5px;">🚀 Active Projects</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; height: calc(100% - 45px); overflow-y: auto; padding-right: 5px;">
        ${projectsHtml || '<div class="empty-state">No active projects.</div>'}
      </div>
    `;

    // Attach status change events
    el.clientColProjects.querySelectorAll('.status-select-action').forEach(select => {
      select.addEventListener('change', (e) => {
        const phone = e.target.getAttribute('data-client-phone');
        const projId = e.target.getAttribute('data-project-id');
        const newStatus = e.target.value;
        appStore.updateProjectStatus(phone, projId, newStatus);
      });
    });

    // ----------------------------------------------------
    // COLUMN 4: Prompt History
    // ----------------------------------------------------
    const promptHistoryHtml = client.promptHistory.map(ph => {
      let mediaHtml = '';
      if (ph.media) {
        const mediaType = ph.mediaType || (ph.media.endsWith('.mp4') ? 'video' : (ph.media.endsWith('.mp3') ? 'audio' : 'image'));
        if (mediaType === 'image') {
          mediaHtml = `
            <div class="history-media-container" style="margin-top: 8px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-subtle);">
              <img src="${ph.media}" alt="Reference image" class="msg-img-preview" style="width: 100%; max-height: 120px; object-fit: cover; display: block;" />
            </div>
          `;
        } else if (mediaType === 'video') {
          mediaHtml = `
            <div class="history-media-container" style="margin-top: 8px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-subtle);">
              <video src="${ph.media}" controls class="msg-video-preview" style="width: 100%; max-height: 120px; object-fit: cover; display: block; background: #000;"></video>
            </div>
          `;
        } else if (mediaType === 'audio') {
          mediaHtml = `
            <div class="history-media-container" style="margin-top: 8px; background: var(--bg-darker); padding: 8px; border-radius: 6px; border: 1px solid var(--border-subtle);">
              <div class="msg-audio-container" data-src="${ph.media}" style="min-width: unset; gap: 8px;">
                <button class="audio-play-btn" style="width: 24px; height: 24px; font-size: 10px;">▶</button>
                <div class="audio-wave" style="gap: 2px;">
                  <span class="wave-bar" style="height: 10px; width: 2px;"></span>
                  <span class="wave-bar" style="height: 10px; width: 2px;"></span>
                  <span class="wave-bar" style="height: 10px; width: 2px;"></span>
                  <span class="wave-bar" style="height: 10px; width: 2px;"></span>
                  <span class="wave-bar" style="height: 10px; width: 2px;"></span>
                  <span class="wave-bar" style="height: 10px; width: 2px;"></span>
                </div>
                <span class="audio-duration" style="font-size: 10px;">${ph.duration || '0:12'}</span>
              </div>
            </div>
          `;
        }
      }

      const liveStatus = getLiveProjectStatus(client.phone, ph);
      return `
        <div class="prompt-history-card glass-panel" style="padding: 14px; gap: 8px;">
          <div class="history-card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="category-badge badge-${ph.category.toLowerCase().replace(' ', '-').replace(/\s+/g, '-')}" style="font-size: 10px; padding: 2px 6px;">${ph.category}</span>
            <span class="history-card-date" style="font-size: 10px;">${ph.date}</span>
          </div>
          <div class="history-card-msg" style="font-size: 11px;"><strong>Req:</strong> "${ph.userMessage}"</div>
          ${mediaHtml}
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--border-subtle);">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Project Status:</span>
            <span class="status-badge status-${liveStatus.toLowerCase().replace(/\s+/g, '-')}">${liveStatus}</span>
          </div>
          <div class="history-card-prompt" style="font-size: 11px; padding: 8px; margin-top: 4px;">${ph.generatedPrompt}</div>
          <div class="history-card-actions" style="margin-top: 4px; display: flex; justify-content: flex-end;">
            <button class="action-btn copy-btn primary-red-btn" data-prompt="${encodeURIComponent(ph.generatedPrompt)}" style="padding: 6px; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px; width: auto;">
              <svg class="icon-svg" viewBox="0 0 24 24" style="width:12px; height:12px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              <span>Copy Prompt</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    el.clientColPromptHistory.innerHTML = `
      <div class="panel-header" style="padding-bottom: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
        <h3 style="font-size: 14px; font-weight: 700; margin: 0; color: var(--accent-red); text-transform: uppercase; letter-spacing: 0.5px;">🤖 Prompts</h3>
      </div>
      <div class="prompt-history-cards" style="gap: 12px; height: calc(100% - 45px); overflow-y: auto; padding-right: 5px;">
        ${promptHistoryHtml || '<div class="empty-state">No history.</div>'}
      </div>
    `;
  }

  function renderMediaVault(state) {
    // Group media attachments by client
    const clientsMedia = [];

    state.clients.forEach(c => {
      const items = [];
      
      // Prompts
      c.promptHistory.forEach(ph => {
        if (ph.media) {
          items.push({
            url: ph.media,
            clientName: c.name,
            date: ph.date,
            prompt: ph.generatedPrompt,
            mediaType: ph.mediaType || (ph.media.endsWith('.mp4') ? 'video' : (ph.media.endsWith('.mp3') ? 'audio' : 'image')),
            duration: ph.duration,
            status: ph.status || 'Completed',
            phone: c.phone,
            phItem: ph
          });
        }
      });

      // Chats
      const chats = state.chats[c.phone] || [];
      chats.forEach(msg => {
        if (msg.type === 'image' || msg.type === 'video' || msg.type === 'audio') {
          items.push({
            url: msg.text,
            clientName: c.name,
            date: 'Chat History',
            prompt: msg.caption || (msg.type === 'audio' ? 'Voice Note' : 'Reference Attachment'),
            mediaType: msg.type,
            duration: msg.duration,
            status: 'Received',
            phone: c.phone,
            phItem: null
          });
        }
      });

      if (items.length > 0) {
        clientsMedia.push({
          clientName: c.name,
          avatar: c.avatar,
          items: items
        });
      }
    });

    if (clientsMedia.length === 0) {
      el.mediaGrid.innerHTML = `<div class="empty-state">No media attachments found.</div>`;
      return;
    }

    el.mediaGrid.innerHTML = clientsMedia.map(group => {
      const cardsHtml = group.items.map(m => {
        let previewHtml = '';
        if (m.mediaType === 'image') {
          previewHtml = `<img src="${m.url}" alt="Attachment from ${m.clientName}" class="media-card-img" />`;
        } else if (m.mediaType === 'video') {
          previewHtml = `<video src="${m.url}" loop muted playsinline class="media-card-img" style="background: #000; width: 100%; height: 100%; object-fit: cover;" onmouseover="this.play()" onmouseout="this.pause()"></video>`;
        } else if (m.mediaType === 'audio') {
          previewHtml = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(255, 34, 51, 0.08) 0%, var(--bg-card) 100%);">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 1;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255, 34, 51, 0.1); border: 1px solid var(--border-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-red); box-shadow: 0 0 10px var(--accent-red-glow);">
                  <svg class="icon-svg" viewBox="0 0 24 24" style="width: 24px; height: 24px;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                </div>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">Voice Note (${m.duration || '0:12'})</span>
              </div>
            </div>
          `;
        }

        const liveStatus = m.phItem ? getLiveProjectStatus(m.phone, m.phItem) : m.status;

        return `
          <div class="media-card glass-panel animate-zoom-in">
            <div class="media-card-status-badge">
              <span class="status-badge status-${liveStatus.toLowerCase().replace(/\s+/g, '-')}">
                ${liveStatus}
              </span>
            </div>
            ${previewHtml}
            <div class="media-card-overlay">
              <h4>${m.clientName}</h4>
              <p class="media-date">${m.date}</p>
              <p class="media-prompt-ref">${m.prompt}</p>
              <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 11px; color: var(--text-muted);">Status:</span>
                <span class="status-badge status-${liveStatus.toLowerCase().replace(/\s+/g, '-')}">
                  ${liveStatus}
                </span>
              </div>
              <button class="action-btn copy-btn media-copy-btn" data-prompt="${encodeURIComponent(m.prompt)}">
                <svg class="icon-svg" viewBox="0 0 24 24" style="width:12px; height:12px; margin-right:4px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> Copy Associated Prompt
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="media-client-group">
          <div class="media-group-header">
            <div class="chat-avatar" style="width: 32px; height: 32px; font-size: 14px; background: rgba(255, 34, 51, 0.05);">${group.avatar}</div>
            <h2>${group.clientName}</h2>
            <span class="column-count">${group.items.length} files</span>
          </div>
          <div class="media-grid">
            ${cardsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderStatusBoard(state) {
    const pending = [];
    const approval = [];
    const progress = [];
    const completed = [];

    state.clients.forEach(c => {
      c.activeProjects.forEach(p => {
        const item = { ...p, clientName: c.name, phone: c.phone };
        if (p.status === 'Pending Manual Production' || p.status === 'Pending') {
          pending.push(item);
        } else if (p.status === 'Pending Approval') {
          approval.push(item);
        } else if (p.status === 'In Production') {
          progress.push(item);
        } else if (p.status === 'Completed') {
          completed.push(item);
        }
      });
    });

    const renderList = (list) => {
      if (list.length === 0) {
        return `<div class="empty-state" style="padding: 20px; font-size: 11px;">No projects.</div>`;
      }
      return list.map(p => `
        <div class="status-project-card glass-panel" data-phone="${p.phone}">
          <div class="project-card-header">
            <span class="project-card-client">${p.clientName}</span>
          </div>
          <div class="project-card-title" style="margin-top: 4px;">${p.name}</div>
          <p class="project-card-desc" style="margin-top: 4px; line-height: 1.4; color: var(--text-muted);">${p.description || ''}</p>
          <div class="project-card-footer">
            <span class="project-card-cat">${p.category}</span>
            <select class="status-select-action mini-select" data-client-phone="${p.phone}" data-project-id="${p.id}">
              <option value="Pending Manual Production" ${p.status === 'Pending Manual Production' ? 'selected' : ''}>Pending</option>
              <option value="Pending Approval" ${p.status === 'Pending Approval' ? 'selected' : ''}>Approval</option>
              <option value="In Production" ${p.status === 'In Production' ? 'selected' : ''}>Production</option>
              <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>
      `).join('');
    };

    el.colPending.innerHTML = renderList(pending);
    el.colApproval.innerHTML = renderList(approval);
    el.colProgress.innerHTML = renderList(progress);
    el.colCompleted.innerHTML = renderList(completed);

    el.countPending.textContent = pending.length;
    el.countApproval.textContent = approval.length;
    el.countProgress.textContent = progress.length;
    el.countCompleted.textContent = completed.length;

    // Attach change event listeners for selector dropdowns inside the status board columns
    [el.colPending, el.colApproval, el.colProgress, el.colCompleted].forEach(col => {
      col.querySelectorAll('.status-select-action').forEach(select => {
        select.addEventListener('change', (e) => {
          const phone = e.target.getAttribute('data-client-phone');
          const projId = e.target.getAttribute('data-project-id');
          const newStatus = e.target.value;
          appStore.updateProjectStatus(phone, projId, newStatus);
        });
      });

      // Navigate to the client database view on card click (ignoring click on the dropdown itself)
      col.querySelectorAll('.status-project-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.status-select-action')) return;
          const phone = card.getAttribute('data-phone');
          appStore.updateState({ activeChatPhone: phone });
          appStore.clearUnreads(phone);
          handleViewSwitch('clients');
        });
      });
    });
  }

  // ----------------------------------------------------
  // Navigation / Routing
  // ----------------------------------------------------

  function handleViewSwitch(viewName) {
    window.location.hash = viewName;
  }

  function syncStateWithHash() {
    let hash = window.location.hash.substring(1);
    if (!hash || !el.views[hash]) {
      hash = 'dashboard';
    }
    const state = appStore.getState();
    if (state.activeView !== hash) {
      appStore.updateState({ activeView: hash });
    }
  }

  window.addEventListener('hashchange', syncStateWithHash);

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
        handleViewSwitch('clients');
      });
    }
    if (el.statCardPending) {
      el.statCardPending.addEventListener('click', () => {
        handleViewSwitch('clients');
      });
    }



    // Company custom dropdown filter toggle and change in Client Directory
    if (el.clientDbFilterDropdown) {
      const trigger = el.clientDbFilterDropdown.querySelector('.custom-dropdown-trigger');
      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          el.clientDbFilterDropdown.classList.toggle('open');
        });
      }

      if (el.customDropdownOptionsList) {
        el.customDropdownOptionsList.addEventListener('click', (e) => {
          const option = e.target.closest('.custom-dropdown-option');
          if (option) {
            const phone = option.getAttribute('data-value');
            appStore.updateState({ activeChatPhone: phone });
            el.clientDbFilterDropdown.classList.remove('open');
          }
        });
      }

      document.addEventListener('click', (e) => {
        if (!el.clientDbFilterDropdown.contains(e.target)) {
          el.clientDbFilterDropdown.classList.remove('open');
        }
      });
    }

    // Back button in Client Directory top-bar - switches back to dashboard view
    if (el.toggleSidebarBtn) {
      el.toggleSidebarBtn.addEventListener('click', () => {
        handleViewSwitch('dashboard');
      });
    }

    // Back button in Status Board top-bar - switches back to dashboard view
    const toggleStatusSidebarBtn = document.querySelector('.toggle-sidebar-status-btn');
    if (toggleStatusSidebarBtn) {
      toggleStatusSidebarBtn.addEventListener('click', () => {
        handleViewSwitch('dashboard');
      });
    }

    // Back button in Media Vault top-bar - switches back to dashboard view
    const toggleMediaSidebarBtn = document.querySelector('.toggle-sidebar-media-btn');
    if (toggleMediaSidebarBtn) {
      toggleMediaSidebarBtn.addEventListener('click', () => {
        handleViewSwitch('dashboard');
      });
    }

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
        // Auto-switch to clients view and client chat so they see it happen
        const template = MOCK_TEMPLATES[idx];
        const client = appStore.getState().clients.find(c => c.id === template.clientId);
        
        appStore.updateState({ activeChatPhone: client.phone });
        appStore.clearUnreads(client.phone);
        handleViewSwitch('clients');
        
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
      const client = appStore.getState().clients.find(c => c.id === t.clientId);
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
    // Fade out splash
    setTimeout(() => {
      el.splash.classList.add('fade-out');
      // Make app container visible during fade out
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        appContainer.style.display = 'flex';
      }
      // Once faded, render first views
      setTimeout(() => {
        el.splash.style.display = 'none';
      }, 600);
    }, 7500);
  }

  // ----------------------------------------------------
  // Initialization Entrypoint
  // ----------------------------------------------------

  function startApp() {
    initElements();
    
    // Set initial view from hash if present
    syncStateWithHash();
    
    // Set initial client in clients database detail pane
    if (appStore.getState().clients.length > 0) {
      const activePhone = appStore.getState().activeChatPhone;
      const initialClient = appStore.getState().clients.find(c => c.phone === activePhone) || appStore.getState().clients[0];
      renderClientDetails(initialClient);
    }

    // Subscribe UI Renderers to State Changes
    appStore.subscribe((state) => {
      // Sync hash to state if they differ
      let currentHash = window.location.hash.substring(1);
      if (!currentHash) currentHash = 'dashboard';
      if (currentHash !== state.activeView) {
        window.location.hash = state.activeView;
      }

      updateActiveViewUI(state.activeView);
      
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        if (state.activeView === 'clients' || state.activeView === 'status' || state.activeView === 'media') {
          appContainer.classList.add('sidebar-hidden');
        } else {
          appContainer.classList.remove('sidebar-hidden');
        }
      }
      
      if (state.activeView === 'dashboard') {
        renderDashboard(state);
      } else if (state.activeView === 'clients') {
        renderClients(state);
        const activeClient = state.clients.find(c => c.phone === state.activeChatPhone) || state.clients[0];
        renderClientDetails(activeClient);
      } else if (state.activeView === 'media') {
        renderMediaVault(state);
      } else if (state.activeView === 'status') {
        renderStatusBoard(state);
      }
    });

    // Attach global actions & event loops
    attachGlobalListeners();
    setupAudioPlayerEvents();
    setupSimulatorControls();

    // Trigger initial dashboard rendering
    renderDashboard(appStore.getState());

    // Start initialization splash screen
    startSplashSequence();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startApp();
  } else {
    window.addEventListener('DOMContentLoaded', startApp);
  }
})();
