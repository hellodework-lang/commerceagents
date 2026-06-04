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

      // New Dashboard Widgets
      activityFeedList: document.getElementById('activity-feed-list'),
      activityFeedCount: document.getElementById('activity-feed-count'),
      campaignChartCanvas: document.getElementById('campaign-chart-canvas'),
      topClientsList: document.getElementById('top-clients-list'),
      topClientsCount: document.getElementById('top-clients-count'),
      aiQueueDepth: document.getElementById('ai-queue-depth'),
      aiUptime: document.getElementById('ai-uptime'),
      pendingApprovalsList: document.getElementById('pending-approvals-list'),
      pendingApprovalsCount: document.getElementById('pending-approvals-count'),
      weeklyCompleted: document.getElementById('weekly-completed'),
      weeklyCompletedChange: document.getElementById('weekly-completed-change'),
      weeklyPrompts: document.getElementById('weekly-prompts'),
      weeklyPromptsChange: document.getElementById('weekly-prompts-change'),
      weeklyResponseTime: document.getElementById('weekly-response-time'),
      weeklyEngagement: document.getElementById('weekly-engagement'),
      pipelineTotal: document.getElementById('pipeline-total'),
      pipeCountPending: document.getElementById('pipe-count-pending'),
      pipeCountApproval: document.getElementById('pipe-count-approval'),
      pipeCountProduction: document.getElementById('pipe-count-production'),
      pipeCountCompleted: document.getElementById('pipe-count-completed'),
      pipeSegPending: document.getElementById('pipe-seg-pending'),
      pipeSegApproval: document.getElementById('pipe-seg-approval'),
      pipeSegProduction: document.getElementById('pipe-seg-production'),
      pipeSegCompleted: document.getElementById('pipe-seg-completed'),
      
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
      simulatorTemplates: document.getElementById('simulator-templates'),
      
      // Hero Copilot Chatbot
      heroChatLog: document.getElementById('hero-chat-log'),
      heroChatInput: document.getElementById('hero-chat-input'),
      heroChatSend: document.getElementById('hero-chat-send'),
      copilotLauncherBtn: document.getElementById('copilot-launcher-btn'),
      copilotChatWindow: document.getElementById('copilot-chat-window'),
      copilotChatClose: document.getElementById('copilot-chat-close')
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
    if (el.statClientsCount) el.statClientsCount.textContent = state.clients.length;
    if (el.statPromptsCount) el.statPromptsCount.textContent = state.recentPrompts.length;
    
    // Pending Tasks Count
    let pendingCount = 0;
    state.clients.forEach(c => {
      pendingCount += c.activeProjects.filter(p => p.status === 'Pending Manual Production').length;
    });
    if (el.statPendingTasks) el.statPendingTasks.textContent = pendingCount;

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
    // Render all new dashboard widgets
    renderActivityFeed(state);
    renderCampaignChart(state);
    renderTopClients(state);
    renderAIStatus(state);
    renderPendingApprovals(state);
    renderWeeklySummary(state);
    renderPipelineBar(state);

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

  // ============================================================
  // NEW DASHBOARD WIDGET RENDER FUNCTIONS
  // ============================================================

  function renderActivityFeed(state) {
    if (!el.activityFeedList) return;

    // Build activity events from recent prompts and chat data
    const events = [];

    // Add prompt generation events
    state.recentPrompts.forEach(p => {
      events.push({
        type: 'prompt',
        text: `<strong>${p.clientName}</strong> — AI prompt generated for "${p.category}"`,
        detail: p.generatedPrompt ? p.generatedPrompt.substring(0, 60) + '...' : '',
        date: new Date(p.date),
        dotColor: 'blue'
      });
    });

    // Add project status events from all clients
    state.clients.forEach(c => {
      c.activeProjects.forEach(p => {
        if (p.status === 'Completed') {
          events.push({
            type: 'completed',
            text: `<strong>${c.name}</strong> — Project "${p.name}" completed`,
            date: new Date('2026-05-30'),
            dotColor: 'green'
          });
        } else if (p.status === 'Pending Approval') {
          events.push({
            type: 'approval',
            text: `<strong>${c.name}</strong> — "${p.name}" awaiting client approval`,
            date: new Date('2026-05-31'),
            dotColor: 'orange'
          });
        } else if (p.status === 'In Production') {
          events.push({
            type: 'production',
            text: `<strong>${c.name}</strong> — "${p.name}" moved to production`,
            date: new Date('2026-06-01'),
            dotColor: 'purple'
          });
        }
      });
    });

    // Sort by date descending and take top 6
    events.sort((a, b) => b.date - a.date);
    const topEvents = events.slice(0, 6);

    if (el.activityFeedCount) {
      el.activityFeedCount.textContent = `${topEvents.length} events`;
    }

    if (topEvents.length === 0) {
      el.activityFeedList.innerHTML = '<div class="empty-state" style="padding: 20px; font-size: 12px;">No recent activity.</div>';
      return;
    }

    const timeAgoLabels = ['2 min ago', '15 min ago', '1 hr ago', '3 hrs ago', '6 hrs ago', 'Yesterday'];

    el.activityFeedList.innerHTML = topEvents.map((evt, i) => `
      <div class="activity-feed-item">
        <div class="activity-dot-col">
          <span class="activity-dot ${evt.dotColor}"></span>
          ${i < topEvents.length - 1 ? '<span class="activity-line"></span>' : ''}
        </div>
        <div class="activity-content">
          <div class="activity-text">${evt.text}</div>
          <div class="activity-time">${timeAgoLabels[i] || evt.date.toLocaleDateString()}</div>
        </div>
      </div>
    `).join('');
  }

  function renderCampaignChart(state) {
    const canvas = el.campaignChartCanvas;
    if (!canvas) return;

    const container = canvas.parentElement;
    
    // Defer rendering if container has no dimensions yet (e.g., during splash)
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      requestAnimationFrame(() => renderCampaignChart(state));
      return;
    }

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size based on container
    canvas.width = container.offsetWidth * dpr;
    canvas.height = container.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = container.offsetWidth;
    const h = container.offsetHeight;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Prepare data: prompts per client
    const clientData = state.clients.map(c => ({
      name: c.name.length > 12 ? c.name.substring(0, 12) + '…' : c.name,
      prompts: c.promptHistory ? c.promptHistory.length : 0,
      projects: c.activeProjects ? c.activeProjects.length : 0
    }));

    if (clientData.length === 0) return;

    const barColors = [
      'rgba(255, 34, 51, 0.7)',
      'rgba(46, 204, 113, 0.7)',
      'rgba(241, 196, 15, 0.7)',
      'rgba(52, 152, 219, 0.7)',
      'rgba(155, 89, 182, 0.7)'
    ];
    const barGlowColors = [
      'rgba(255, 34, 51, 0.3)',
      'rgba(46, 204, 113, 0.3)',
      'rgba(241, 196, 15, 0.3)',
      'rgba(52, 152, 219, 0.3)',
      'rgba(155, 89, 182, 0.3)'
    ];

    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const maxVal = Math.max(...clientData.map(d => d.prompts + d.projects), 1);
    const barGroupWidth = chartW / clientData.length;
    const barWidth = Math.min(barGroupWidth * 0.3, 35);
    const barGap = 4;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = 'rgba(140, 140, 158, 0.6)';
      ctx.font = '10px Outfit';
      ctx.textAlign = 'right';
      ctx.fillText(val.toString(), padding.left - 8, y + 4);
    }

    // Draw bars for each client (prompts bar + projects bar)
    clientData.forEach((d, i) => {
      const x = padding.left + barGroupWidth * i + (barGroupWidth - (barWidth * 2 + barGap)) / 2;

      // Prompts bar
      const barH1 = (d.prompts / maxVal) * chartH;
      const y1 = padding.top + chartH - barH1;

      // Bar glow
      ctx.shadowColor = barGlowColors[i % barGlowColors.length];
      ctx.shadowBlur = 12;

      // Rounded rect for prompts
      const radius = 4;
      ctx.fillStyle = barColors[i % barColors.length];
      ctx.beginPath();
      ctx.moveTo(x + radius, y1);
      ctx.lineTo(x + barWidth - radius, y1);
      ctx.quadraticCurveTo(x + barWidth, y1, x + barWidth, y1 + radius);
      ctx.lineTo(x + barWidth, padding.top + chartH);
      ctx.lineTo(x, padding.top + chartH);
      ctx.lineTo(x, y1 + radius);
      ctx.quadraticCurveTo(x, y1, x + radius, y1);
      ctx.fill();

      // Projects bar (slightly different shade)
      const barH2 = (d.projects / maxVal) * chartH;
      const y2 = padding.top + chartH - barH2;
      const x2 = x + barWidth + barGap;

      ctx.fillStyle = barColors[i % barColors.length].replace('0.7', '0.35');
      ctx.beginPath();
      ctx.moveTo(x2 + radius, y2);
      ctx.lineTo(x2 + barWidth - radius, y2);
      ctx.quadraticCurveTo(x2 + barWidth, y2, x2 + barWidth, y2 + radius);
      ctx.lineTo(x2 + barWidth, padding.top + chartH);
      ctx.lineTo(x2, padding.top + chartH);
      ctx.lineTo(x2, y2 + radius);
      ctx.quadraticCurveTo(x2, y2, x2 + radius, y2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Value labels on top of bars
      ctx.fillStyle = '#f0f0f5';
      ctx.font = 'bold 11px Outfit';
      ctx.textAlign = 'center';
      if (barH1 > 15) ctx.fillText(d.prompts.toString(), x + barWidth / 2, y1 - 6);
      if (barH2 > 15) ctx.fillText(d.projects.toString(), x2 + barWidth / 2, y2 - 6);

      // Client name labels
      ctx.fillStyle = 'rgba(140, 140, 158, 0.8)';
      ctx.font = '11px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(d.name, x + barWidth + barGap / 2, h - 10);
    });

    // Legend
    const legendY = h - 26;
    ctx.font = '10px Outfit';
    ctx.fillStyle = 'rgba(140, 140, 158, 0.6)';

    // Prompts legend
    ctx.fillStyle = 'rgba(255, 34, 51, 0.7)';
    ctx.fillRect(w - 160, legendY - 8, 8, 8);
    ctx.fillStyle = 'rgba(140, 140, 158, 0.8)';
    ctx.textAlign = 'left';
    ctx.fillText('Prompts', w - 148, legendY);

    // Projects legend
    ctx.fillStyle = 'rgba(255, 34, 51, 0.35)';
    ctx.fillRect(w - 85, legendY - 8, 8, 8);
    ctx.fillStyle = 'rgba(140, 140, 158, 0.8)';
    ctx.fillText('Projects', w - 73, legendY);
  }

  function renderTopClients(state) {
    if (!el.topClientsList) return;

    if (el.topClientsCount) {
      el.topClientsCount.textContent = `${state.clients.length} clients`;
    }

    el.topClientsList.innerHTML = state.clients.map(c => {
      const activeCount = c.activeProjects.filter(p => p.status !== 'Completed').length;
      const totalProjects = c.activeProjects.length;

      // Get last chat message time
      const chats = state.chats[c.phone] || [];
      const lastMsg = chats.length > 0 ? chats[chats.length - 1] : null;
      const lastTime = lastMsg ? lastMsg.time : 'No messages';

      return `
        <div class="top-client-row" data-phone="${c.phone}">
          <div class="top-client-avatar">${c.avatar}</div>
          <div class="top-client-info">
            <div class="top-client-name">${c.name}</div>
            <div class="top-client-meta">Last: ${lastTime} · ${c.phone}</div>
          </div>
          <div class="top-client-stats">
            <span class="top-client-proj-count">${activeCount}/${totalProjects} active</span>
            <button class="top-client-view-btn" data-phone="${c.phone}">View →</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers
    el.topClientsList.querySelectorAll('.top-client-row').forEach(row => {
      row.addEventListener('click', () => {
        const phone = row.getAttribute('data-phone');
        appStore.updateState({ activeChatPhone: phone });
        appStore.clearUnreads(phone);
        handleViewSwitch('clients');
      });
    });
  }

  // Uptime timer state
  let uptimeSeconds = 0;
  let uptimeInterval = null;

  function startUptimeTimer() {
    if (uptimeInterval) return;
    uptimeInterval = setInterval(() => {
      uptimeSeconds++;
      if (el.aiUptime) {
        const hrs = String(Math.floor(uptimeSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(uptimeSeconds % 60).padStart(2, '0');
        el.aiUptime.textContent = `${hrs}:${mins}:${secs}`;
      }
    }, 1000);
  }

  function renderAIStatus(state) {
    // Update queue depth from pending production projects
    let queueDepth = 0;
    state.clients.forEach(c => {
      queueDepth += c.activeProjects.filter(p => p.status === 'Pending Manual Production').length;
    });
    if (el.aiQueueDepth) {
      el.aiQueueDepth.textContent = `${queueDepth} pending`;
    }
  }

  function renderPendingApprovals(state) {
    if (!el.pendingApprovalsList) return;

    const approvals = [];
    state.clients.forEach(c => {
      c.activeProjects.forEach(p => {
        if (p.status === 'Pending Approval') {
          approvals.push({
            projectName: p.name,
            clientName: c.name,
            phone: c.phone,
            projectId: p.id,
            daysWaiting: Math.floor(Math.random() * 5) + 1 // Mock days
          });
        }
      });
    });

    if (el.pendingApprovalsCount) {
      el.pendingApprovalsCount.textContent = approvals.length.toString();
    }

    if (approvals.length === 0) {
      el.pendingApprovalsList.innerHTML = `
        <div class="empty-approvals">
          <span class="check-icon">✅</span>
          <span>No pending approvals — all clear!</span>
        </div>
      `;
      return;
    }

    el.pendingApprovalsList.innerHTML = approvals.map(a => `
      <div class="pending-approval-item">
        <div class="pending-approval-info">
          <div class="pending-approval-project">${a.projectName}</div>
          <div class="pending-approval-client">${a.clientName}</div>
        </div>
        <div class="pending-approval-days">${a.daysWaiting}d waiting</div>
        <button class="pending-approval-action" data-phone="${a.phone}">View</button>
      </div>
    `).join('');

    // Attach view clicks
    el.pendingApprovalsList.querySelectorAll('.pending-approval-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const phone = btn.getAttribute('data-phone');
        appStore.updateState({ activeChatPhone: phone });
        appStore.clearUnreads(phone);
        handleViewSwitch('clients');
      });
    });
  }

  function renderWeeklySummary(state) {
    // Compute stats from mock data
    let completedCount = 0;
    state.clients.forEach(c => {
      completedCount += c.activeProjects.filter(p => p.status === 'Completed').length;
    });

    const totalPrompts = state.recentPrompts ? state.recentPrompts.length : 0;

    if (el.weeklyCompleted) el.weeklyCompleted.textContent = completedCount;
    if (el.weeklyCompletedChange) el.weeklyCompletedChange.textContent = '↑ 33%';
    if (el.weeklyPrompts) el.weeklyPrompts.textContent = totalPrompts;
    if (el.weeklyPromptsChange) el.weeklyPromptsChange.textContent = '↑ 25%';
    if (el.weeklyResponseTime) el.weeklyResponseTime.textContent = '1.2s';
    if (el.weeklyEngagement) el.weeklyEngagement.textContent = '87%';
  }

  function renderPipelineBar(state) {
    let pending = 0, approval = 0, production = 0, completed = 0;

    state.clients.forEach(c => {
      c.activeProjects.forEach(p => {
        if (p.status === 'Pending Manual Production' || p.status === 'Pending') pending++;
        else if (p.status === 'Pending Approval') approval++;
        else if (p.status === 'In Production') production++;
        else if (p.status === 'Completed') completed++;
      });
    });

    const total = pending + approval + production + completed;

    if (el.pipelineTotal) el.pipelineTotal.textContent = `${total} total`;
    if (el.pipeCountPending) el.pipeCountPending.textContent = pending;
    if (el.pipeCountApproval) el.pipeCountApproval.textContent = approval;
    if (el.pipeCountProduction) el.pipeCountProduction.textContent = production;
    if (el.pipeCountCompleted) el.pipeCountCompleted.textContent = completed;

    // Update flex proportions based on counts
    const minFlex = 0.5;
    if (el.pipeSegPending) el.pipeSegPending.style.flex = Math.max(pending, minFlex);
    if (el.pipeSegApproval) el.pipeSegApproval.style.flex = Math.max(approval, minFlex);
    if (el.pipeSegProduction) el.pipeSegProduction.style.flex = Math.max(production, minFlex);
    if (el.pipeSegCompleted) el.pipeSegCompleted.style.flex = Math.max(completed, minFlex);
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
            <div class="custom-status-dropdown" data-client-phone="${p.phone}" data-project-id="${p.id}">
              <div class="custom-status-trigger">
                <span>${p.status === 'Pending Manual Production' ? 'Pending' : (p.status === 'Pending Approval' ? 'Approval' : (p.status === 'In Production' ? 'Production' : 'Completed'))}</span>
                <svg class="icon-svg status-dropdown-arrow" viewBox="0 0 24 24" style="width: 10px; height: 10px; margin-left: 4px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              <div class="custom-status-options">
                <div class="custom-status-option ${p.status === 'Pending Manual Production' ? 'selected' : ''}" data-value="Pending Manual Production">Pending</div>
                <div class="custom-status-option ${p.status === 'Pending Approval' ? 'selected' : ''}" data-value="Pending Approval">Approval</div>
                <div class="custom-status-option ${p.status === 'In Production' ? 'selected' : ''}" data-value="In Production">Production</div>
                <div class="custom-status-option ${p.status === 'Completed' ? 'selected' : ''}" data-value="Completed">Completed</div>
              </div>
            </div>
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

    // Attach click listeners on status cards
    [el.colPending, el.colApproval, el.colProgress, el.colCompleted].forEach(col => {
      // Navigate to the client database view on card click (ignoring click on the dropdown itself)
      col.querySelectorAll('.status-project-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.custom-status-dropdown')) return;
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
        handleViewSwitch('status');
      });
    }

    // Quick Actions Bar clicks
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (action === 'simulator') {
          el.simulatorPanel.classList.add('open');
        } else if (action === 'clients' || action === 'status' || action === 'media') {
          handleViewSwitch(action);
        }
      });
    });

    // Pipeline segment clicks
    document.querySelectorAll('.pipeline-segment').forEach(seg => {
      seg.addEventListener('click', () => {
        handleViewSwitch('status');
      });
    });

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
        if (el.clientDbFilterDropdown && !el.clientDbFilterDropdown.contains(e.target)) {
          el.clientDbFilterDropdown.classList.remove('open');
        }

        // Handle custom status dropdown trigger click inside project cards
        const statusTrigger = e.target.closest('.custom-status-trigger');
        if (statusTrigger) {
          e.stopPropagation();
          const dropdown = statusTrigger.closest('.custom-status-dropdown');
          
          // Close all other status dropdowns first
          document.querySelectorAll('.custom-status-dropdown.open').forEach(d => {
            if (d !== dropdown) d.classList.remove('open');
          });
          
          dropdown.classList.toggle('open');
          return;
        }

        // Handle custom status option click
        const statusOption = e.target.closest('.custom-status-option');
        if (statusOption) {
          e.stopPropagation();
          const dropdown = statusOption.closest('.custom-status-dropdown');
          const phone = dropdown.getAttribute('data-client-phone');
          const projId = dropdown.getAttribute('data-project-id');
          const newStatus = statusOption.getAttribute('data-value');
          
          appStore.updateProjectStatus(phone, projId, newStatus);
          return;
        }

        // Clicked outside, close all status dropdowns
        document.querySelectorAll('.custom-status-dropdown.open').forEach(d => {
          d.classList.remove('open');
        });
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
  // Hero Copilot Chatbot Controller
  // ----------------------------------------------------
  function initHeroChat() {
    if (!el.heroChatLog || !el.heroChatInput || !el.heroChatSend) return;

    function appendMessage(sender, text, isBot = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `hero-chat-msg ${isBot ? 'bot' : 'user'}`;
      msgDiv.style.lineHeight = '1.4';
      
      const labelSpan = document.createElement('span');
      labelSpan.style.color = isBot ? 'var(--accent-red)' : '#3498db';
      labelSpan.style.fontWeight = 'bold';
      labelSpan.textContent = `[${sender}]: `;
      
      msgDiv.appendChild(labelSpan);
      msgDiv.appendChild(document.createTextNode(text));
      
      el.heroChatLog.appendChild(msgDiv);
      el.heroChatLog.scrollTop = el.heroChatLog.scrollHeight;
    }

    function processQuery(query) {
      const q = query.toLowerCase().trim();
      const state = appStore.getState();

      // Helper to format project list for a client
      function getClientProjectStatus(clientKey, clientName) {
        const client = state.clients.find(c => c.id.toLowerCase().includes(clientKey) || c.name.toLowerCase().includes(clientKey));
        if (!client) return `I couldn't find client "${clientName}" in our records.`;
        
        if (!client.activeProjects || client.activeProjects.length === 0) {
          return `${client.name} currently has no active projects.`;
        }
        
        const projDetails = client.activeProjects.map(p => `'${p.name}' (${p.status})`).join(', ');
        return `${client.name} active campaigns: ${projDetails}.`;
      }

      // Check keywords
      if (q.includes('nike')) {
        return getClientProjectStatus('nike', 'Nike');
      }
      if (q.includes('starbucks')) {
        return getClientProjectStatus('starbucks', 'Starbucks');
      }
      if (q.includes('burger') || q.includes('local burger')) {
        return getClientProjectStatus('burger', 'Local Burger');
      }
      if (q.includes('list') || q.includes('all project') || q.includes('active project') || q.includes('every project')) {
        let response = 'Active dashboard projects list:\n';
        state.clients.forEach(c => {
          const projs = c.activeProjects.map(p => `'${p.name}' (${p.status})`).join(', ') || 'No projects';
          response += `• ${c.name}: ${projs}\n`;
        });
        return response.trim();
      }
      if (q.includes('prompt') || q.includes('how many prompt') || q.includes('count')) {
        let totalPrompts = state.recentPrompts ? state.recentPrompts.length : 0;
        state.clients.forEach(c => {
          if (c.promptHistory) totalPrompts += c.promptHistory.length;
        });
        return `We have generated a total of ${totalPrompts} AI creative prompts in this workspace.`;
      }
      if (q.includes('help') || q.includes('what can i') || q.includes('question') || q.includes('hello') || q.includes('hi')) {
        return `Hello! I am Copilot, your dashboard mascot. You can ask me queries like:\n- "Nike project status"\n- "Starbucks campaign status"\n- "List all projects"\n- "How many prompts generated?"`;
      }

      // Default fallback response
      return `I'm not sure how to answer that. Try asking "what is the status of the Nike project?" or "list all projects".`;
    }

    function handleSend() {
      const query = el.heroChatInput.value.trim();
      if (!query) return;

      // 1. Show user message
      appendMessage('You', query, false);
      el.heroChatInput.value = '';

      // 2. Trigger mascot think and blink animations on the window if available
      if (typeof window.triggerHomeRobotThink === 'function') {
        window.triggerHomeRobotThink();
      }
      if (typeof window.triggerHomeRobotBlink === 'function') {
        window.triggerHomeRobotBlink();
      }

      // 3. Show animated typing indicator with bouncing dots
      const typingDiv = document.createElement('div');
      typingDiv.className = 'hero-chat-msg bot typing-indicator';
      typingDiv.innerHTML = `<span style="color: var(--accent-red); font-weight: bold;">[Copilot]: </span><span class="typing-dots"><span></span><span></span><span></span></span>`;
      el.heroChatLog.appendChild(typingDiv);
      el.heroChatLog.scrollTop = el.heroChatLog.scrollHeight;

      // 4. Simulate small delay for processing
      setTimeout(() => {
        // Remove typing indicator
        if (typingDiv.parentNode) {
          typingDiv.parentNode.removeChild(typingDiv);
        }

        // Formulate response
        const answer = processQuery(query);

        // Append bot response
        appendMessage('Copilot', answer, true);

        // Trigger another cute blink response
        if (typeof window.triggerHomeRobotBlink === 'function') {
          window.triggerHomeRobotBlink();
        }
      }, 500);
    }

    el.heroChatSend.addEventListener('click', handleSend);
    el.heroChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    });

    // --- Floating Widget Toggle Logic ---
    function openChat() {
      // Step 1: make it visible in layout (display:flex)
      el.copilotChatWindow.style.display = 'flex';
      // Step 2: one frame later trigger the CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.copilotChatWindow.classList.add('open');
        });
      });
      // Step 3: focus input after transition
      setTimeout(() => {
        if (el.heroChatInput) el.heroChatInput.focus();
      }, 320);
      // Blink greeting
      if (typeof window.triggerHomeRobotBlink === 'function') {
        window.triggerHomeRobotBlink();
      }
    }

    function closeChat() {
      el.copilotChatWindow.classList.remove('open');
      // After the CSS transition finishes, truly hide so backdrop-filter doesn't bleed
      setTimeout(() => {
        el.copilotChatWindow.style.display = 'none';
      }, 320);
    }

    if (el.copilotLauncherBtn && el.copilotChatWindow) {
      el.copilotLauncherBtn.addEventListener('click', () => {
        const isOpen = el.copilotChatWindow.classList.contains('open');
        isOpen ? closeChat() : openChat();
      });
    }

    if (el.copilotChatClose && el.copilotChatWindow) {
      el.copilotChatClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeChat();
      });
    }
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

    // Initialize hero card Copilot chatbot
    initHeroChat();

    // Trigger initial dashboard rendering
    renderDashboard(appStore.getState());

    // Start uptime counter
    startUptimeTimer();

    // Start initialization splash screen
    startSplashSequence();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startApp();
  } else {
    window.addEventListener('DOMContentLoaded', startApp);
  }
})();
