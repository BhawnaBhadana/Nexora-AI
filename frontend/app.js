// ===== CONFIG =====
const BACKEND = "https://nexora-ai-cair.onrender.com";

// ===== STATE =====
let currentUser = null;
let darkMode = false;
let chatHistory = [];
let userPlan = "free";
let usage = { chat: 0, notes: 0, images: 0 };
const LIMITS = {
  free: { chat: 20, notes: 10, images: 5 },
  pro:  { chat: 99999, notes: 99999, images: 50 }
};

// ===== BACKEND AI HELPERS =====

// Non-streaming: returns full text (mock test, resume, planner, notes summary)
async function callAI(systemPrompt, userMessage) {
  const res = await fetch(`${BACKEND}/api/ai/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: systemPrompt, message: userMessage })
  });
  const data = await res.json();
  if (!data.result) throw new Error(data.message || "AI error");
  return data.result;
}

// Streaming: writes text into a DOM element token by token
async function streamAI(systemPrompt, userMessage, targetElement) {
  targetElement.innerHTML = "";
  let fullText = "";

  const res = await fetch(`${BACKEND}/api/ai/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: systemPrompt, message: userMessage })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") return fullText;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.text) {
          fullText += parsed.text;
          targetElement.innerHTML = formatText(fullText);
        }
      } catch (e) {}
    }
  }
  return fullText;
}

// Simple markdown → HTML formatter
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.*)/gm, "<h4 style='margin:10px 0 4px'>$1</h4>")
    .replace(/^## (.*)/gm,  "<h3 style='margin:12px 0 5px'>$1</h3>")
    .replace(/^# (.*)/gm,   "<h2 style='margin:14px 0 6px'>$1</h2>")
    .replace(/\n/g, "<br>");
}

// ===== AUTH =====
function switchTab(tab, btn) {
  document.getElementById("loginForm").style.display  = tab === "login"  ? "block" : "none";
  document.getElementById("signupForm").style.display = tab === "signup" ? "block" : "none";
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  else document.querySelectorAll(".tab-btn")[tab === "login" ? 0 : 1].classList.add("active");
  document.getElementById("bottomToggle").innerHTML = tab === "login"
    ? `Don't have an account? <a onclick="switchTab('signup',null)">Sign up free</a>`
    : `Already have an account? <a onclick="switchTab('login',null)">Sign in</a>`;
}

function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === "password";
  inp.type = show ? "text" : "password";
  btn.innerHTML = `<i class="ti ti-eye${show ? "-off" : ""}"></i>`;
}

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

async function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass  = document.getElementById("loginPass").value;
  let ok = true;
  document.getElementById("loginEmailErr").style.display = "none";
  document.getElementById("loginPassErr").style.display  = "none";
  if (!validateEmail(email)) { document.getElementById("loginEmailErr").style.display = "block"; ok = false; }
  if (pass.length < 6)       { document.getElementById("loginPassErr").style.display  = "block"; ok = false; }
  if (!ok) return;

  try {
    const res  = await fetch(`${BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || "Login failed", "danger"); return; }
    currentUser = data.user;
    if (document.getElementById("rememberMe").checked)
      localStorage.setItem("nexora-session", JSON.stringify({ email, token: data.token, name: data.user.name }));
    localStorage.setItem("nexora-token", data.token);
    loadUserData();
    enterApp();
  } catch (err) {
    // fallback: local-only login
    const users = JSON.parse(localStorage.getItem("nexora-users") || "{}");
    if (!users[email])               { showToast("Account not found. Please sign up.", "warning"); return; }
    if (users[email].password !== btoa(pass)) { showToast("Incorrect password.", "danger"); return; }
    currentUser = { email, name: users[email].name };
    if (document.getElementById("rememberMe").checked)
      localStorage.setItem("nexora-session", JSON.stringify(currentUser));
    loadUserData();
    enterApp();
  }
}

async function doSignup() {
  const name  = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass  = document.getElementById("signupPass").value;
  let ok = true;
  document.getElementById("signupNameErr").style.display  = "none";
  document.getElementById("signupEmailErr").style.display = "none";
  document.getElementById("signupPassErr").style.display  = "none";
  if (!name)               { document.getElementById("signupNameErr").style.display  = "block"; ok = false; }
  if (!validateEmail(email)) { document.getElementById("signupEmailErr").style.display = "block"; ok = false; }
  if (pass.length < 6)     { document.getElementById("signupPassErr").style.display  = "block"; ok = false; }
  if (!ok) return;

  try {
    const res  = await fetch(`${BACKEND}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || "Registration failed", "danger"); return; }
    currentUser = data.user;
    localStorage.setItem("nexora-session", JSON.stringify({ email, token: data.token, name }));
    localStorage.setItem("nexora-token", data.token);
    loadUserData();
    enterApp();
  } catch (err) {
    // fallback: local-only register
    const users = JSON.parse(localStorage.getItem("nexora-users") || "{}");
    if (users[email]) { showToast("Email already registered.", "warning"); return; }
    users[email] = { name, password: btoa(pass) };
    localStorage.setItem("nexora-users", JSON.stringify(users));
    currentUser = { email, name };
    localStorage.setItem("nexora-session", JSON.stringify(currentUser));
    loadUserData();
    enterApp();
  }
}

function demoLogin() {
  currentUser = { email: "demo@nexora.ai", name: "Demo User" };
  loadUserData();
  enterApp();
  showToast("Signed in as Demo User", "success");
}

function loadUserData() {
  const key   = "nexora-data-" + currentUser.email;
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  if (saved) { userPlan = saved.plan || "free"; usage = saved.usage || { chat: 0, notes: 0, images: 0 }; }
  else        { userPlan = "free"; usage = { chat: 0, notes: 0, images: 0 }; }
  const today   = new Date().toDateString();
  const lastDay = localStorage.getItem("nexora-lastday-" + currentUser.email);
  if (lastDay !== today) {
    usage = { chat: 0, notes: 0, images: 0 };
    localStorage.setItem("nexora-lastday-" + currentUser.email, today);
    saveUserData();
  }
}

function saveUserData() {
  if (!currentUser) return;
  localStorage.setItem("nexora-data-" + currentUser.email, JSON.stringify({ plan: userPlan, usage }));
}

function enterApp() {
  document.getElementById("loginPage").classList.remove("show");
  document.getElementById("appPage").classList.add("show");
  const first   = currentUser.name.split(" ")[0];
  const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  document.getElementById("pageSubtitle").innerHTML  = `Welcome back, <strong>${first}</strong>!`;
  document.getElementById("heroGreeting").textContent = `Good to see you, ${first}! 🚀`;
  document.getElementById("profileAvatar").textContent = initials;
  document.getElementById("settingsEmail").textContent = currentUser.email;
  document.getElementById("settingsName").textContent  = currentUser.name;
  updateStreakUI();
  updatePlanUI();
  updateUsageUI();
  updateDailyStreak();
  loadCharts();
  showToast(`Welcome, ${first}! 🚀`, "success");
}

// ===== STREAK =====
function getStreakData() {
  const key = "nexora-streak-" + currentUser.email;
  return JSON.parse(localStorage.getItem(key) || '{"count":0,"lastDate":null,"history":[]}');
}

function saveStreakData(data) {
  localStorage.setItem("nexora-streak-" + currentUser.email, JSON.stringify(data));
}

function updateDailyStreak() {
  const data      = getStreakData();
  const today     = new Date().toDateString();
  if (data.lastDate === today) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  data.count = data.lastDate === yesterday.toDateString() ? data.count + 1 : 1;
  data.lastDate = today;
  if (!data.history) data.history = [];
  data.history.push(today);
  if (data.history.length > 30) data.history = data.history.slice(-30);
  saveStreakData(data);
  if (data.count > 1) showToast(`🔥 ${data.count} day streak! Keep it up!`, "success");
}

function updateStreakUI() {
  const data  = getStreakData();
  const count = data.count || 0;
  const today = new Date().toDateString();
  document.getElementById("topStreakCount").textContent    = count;
  document.getElementById("sidebarStreakCount").textContent = count;
  const as = document.getElementById("analyticsStreak"); if (as) as.textContent = count;
  const ss = document.getElementById("statStreak");      if (ss) ss.textContent = count;

  const sidebarDays = document.getElementById("sidebarStreakDays");
  sidebarDays.innerHTML = "";
  for (let i = 6; i >= 0; i--) {
    const d  = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    const el = document.createElement("div");
    el.className = "streak-day" + ((data.history||[]).includes(ds) ? " done" : "") + (ds === today ? " today" : "");
    el.textContent = ["S","M","T","W","T","F","S"][d.getDay()];
    sidebarDays.appendChild(el);
  }
  const msc = document.getElementById("modalStreakCount");
  if (msc) msc.textContent = count;
  buildStreakWeekGrid(data);
}

function buildStreakWeekGrid(data) {
  const grid = document.getElementById("streakWeekGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = new Date().toDateString();
  for (let i = 6; i >= 0; i--) {
    const d    = new Date(); d.setDate(d.getDate() - i);
    const ds   = d.toDateString();
    const done = (data.history || []).includes(ds);
    const cell = document.createElement("div");
    cell.className = "week-cell";
    cell.innerHTML = `<div class="week-cell-day">${days[d.getDay()]}</div>
      <div class="week-cell-dot${done?" done":""}${ds===today?" today":""}">${done?"✓":d.getDate()}</div>`;
    grid.appendChild(cell);
  }
  const tip   = document.getElementById("streakTip");
  const count = data.count || 0;
  if (tip) {
    if (count >= 7)      tip.textContent = `🏆 Amazing! ${count} day streak. You're on fire!`;
    else if (count >= 3) tip.textContent = `💪 ${count} days strong! Keep the momentum going.`;
    else if (count >= 1) tip.textContent = `🌱 ${count} day streak started! Visit every day to grow it.`;
    else                 tip.textContent = "Log in every day and use any AI feature to start your streak!";
  }
}

function openStreakModal()  { updateStreakUI(); document.getElementById("streakOverlay").classList.add("open"); }
function closeStreakModal() { document.getElementById("streakOverlay").classList.remove("open"); }

// ===== PLAN =====
function updatePlanUI() {
  const isPro = userPlan === "pro";
  const badge = document.getElementById("planBadgeSidebar");
  badge.className = "plan-badge-sidebar" + (isPro ? " pro" : "");
  document.getElementById("planBadgeName").textContent    = isPro ? "PRO PLAN"  : "FREE PLAN";
  document.getElementById("planBadgeUpgrade").textContent = isPro ? "Active"    : "Upgrade";
  document.getElementById("topPlanLabel").textContent     = isPro ? "Pro"       : "Free";
  const sp = document.getElementById("settingsPlan");     if (sp) sp.textContent = isPro ? "Pro ✨" : "Free";
  const ld = document.getElementById("planLabelDash");    if (ld) ld.textContent = isPro ? "Pro Plan ✨" : "Free Plan";
  const freebtn = document.getElementById("freePlanBtn");
  const probtn  = document.getElementById("proPlanBtn");
  if (freebtn && probtn) {
    if (isPro) { freebtn.textContent="Downgrade";freebtn.disabled=false; probtn.textContent="Current Plan ✓";probtn.disabled=true; }
    else        { freebtn.textContent="Current Plan";freebtn.disabled=true; probtn.textContent="Upgrade to Pro →";probtn.disabled=false; }
  }
}

function updateUsageUI() {
  const lim = LIMITS[userPlan];
  const cp  = (v, m) => Math.min((v / m) * 100, 100).toFixed(0) + "%";
  document.getElementById("chatUsageLabel").textContent   = userPlan==="pro" ? `${usage.chat}/∞`          : `${usage.chat}/${lim.chat}`;
  document.getElementById("notesUsageLabel").textContent  = userPlan==="pro" ? `${usage.notes}/∞`         : `${usage.notes}/${lim.notes}`;
  document.getElementById("imagesUsageLabel").textContent = userPlan==="pro" ? `${usage.images}/${lim.images}` : `${usage.images}/${lim.images}`;
  document.getElementById("chatUsageBar").style.width     = cp(usage.chat,   lim.chat);
  document.getElementById("notesUsageBar").style.width    = cp(usage.notes,  lim.notes);
  document.getElementById("imagesUsageBar").style.width   = cp(usage.images, lim.images);
  if (usage.images / lim.images > 0.8)
    document.getElementById("imagesUsageBar").style.background = "linear-gradient(90deg,#F59E0B,#EF4444)";
  document.getElementById("planMiniFill").style.width   = cp(usage.chat, lim.chat);
  document.getElementById("planBadgeLabel").textContent = userPlan==="pro"
    ? `${usage.chat} chats today`
    : `${usage.chat}/${lim.chat} credits used`;
}

function checkLimit(type) {
  if (usage[type] >= LIMITS[userPlan][type]) {
    showToast(`${type} limit reached! Upgrade to Pro for more.`, "warning");
    setTimeout(openUpgradeModal, 800);
    return false;
  }
  return true;
}

function bumpUsage(type) { usage[type]++; saveUserData(); updateUsageUI(); }

function selectPlan(plan) {
  userPlan = plan;
  saveUserData(); updatePlanUI(); updateUsageUI(); closeUpgradeModal();
  showToast(plan==="pro" ? "🎉 Upgraded to Pro! (demo mode)" : "Switched to Free plan", plan==="pro"?"success":"info");
}

function openUpgradeModal()  { updatePlanUI(); document.getElementById("upgradeOverlay").classList.add("open"); }
function closeUpgradeModal() { document.getElementById("upgradeOverlay").classList.remove("open"); }

// ===== PANEL + SIDEBAR =====
function showPanel(id, btn) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  const t = document.getElementById(id);
  if (t) t.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(n => n.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const titles = { dashboard:"Dashboard", chat:"AI Chat", notes:"Notes Generator", imagegen:"Image Generator", resume:"Resume Builder", mocktest:"Mock Test", planner:"Study Planner", analytics:"Analytics", settings:"Settings" };
  document.getElementById("pageTitle").textContent = titles[id] || id;
  if (id === "analytics") loadAnalyticsCharts();
  if (window.innerWidth <= 992) document.getElementById("sidebar").classList.remove("show");
}

function toggleSidebar() {
  const sb = document.getElementById("sidebar");
  const mn = document.getElementById("mainArea");
  if (window.innerWidth > 992) { sb.classList.toggle("hidden"); mn.classList.toggle("full"); }
  else sb.classList.toggle("show");
}

// ===== THEME =====
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark", darkMode);
  document.getElementById("themeIcon").className = darkMode ? "ti ti-moon" : "ti ti-sun";
  localStorage.setItem("nexora-theme", darkMode ? "dark" : "light");
}

// ===== LOGOUT =====
function openLogout()  { document.getElementById("logoutOverlay").classList.add("open"); }
function closeLogout() { document.getElementById("logoutOverlay").classList.remove("open"); }
function doLogout() {
  localStorage.removeItem("nexora-session");
  localStorage.removeItem("nexora-token");
  currentUser = null; chatHistory = []; userPlan = "free"; usage = { chat: 0, notes: 0, images: 0 };
  document.getElementById("chatMessages").innerHTML = "<div class=\"ai-message\">👋 Hi! I'm your Nexora AI assistant. How can I help you today?</div>";
  document.getElementById("appPage").classList.remove("show");
  document.getElementById("loginPage").classList.add("show");
  closeLogout();
  showPanel("dashboard", document.querySelector(".nav-btn"));
  showToast("Logged out successfully.", "success");
}

// ===== CHAT =====
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const chat  = document.getElementById("chatMessages");
  const text  = input.value.trim();
  if (!text) return;
  if (!checkLimit("chat")) return;

  const ud = document.createElement("div"); ud.className = "user-message"; ud.textContent = text;
  chat.appendChild(ud); input.value = ""; chat.scrollTop = chat.scrollHeight;
  chatHistory.push({ role: "user", content: text });

  // build a single message string including recent history for context
  const contextMsg = chatHistory
    .slice(-10)
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const aiDiv = document.createElement("div"); aiDiv.className = "ai-message";
  chat.appendChild(aiDiv); chat.scrollTop = chat.scrollHeight;

  try {
    await streamAI(
      "You are Nexora AI, a helpful, friendly study and career assistant for Indian college students. Be concise and clear. Use **bold** for important terms.",
      contextMsg,
      aiDiv
    );
    chatHistory.push({ role: "assistant", content: aiDiv.textContent });
    bumpUsage("chat");
  } catch (e) {
    aiDiv.innerHTML = "❌ Error: " + e.message;
  }
  chat.scrollTop = chat.scrollHeight;
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement.id === "chatInput") sendMessage();
});

// ===== NOTES =====
async function generateNotes() {
  const topic = document.getElementById("notesTopic").value.trim();
  const style = document.getElementById("notesStyle").value;
  const btn   = document.getElementById("notesBtn");
  const out   = document.getElementById("notesOutput");
  if (!topic) { showToast("Please enter a topic", "warning"); return; }
  if (!checkLimit("notes")) return;

  btn.disabled = true; btn.innerHTML = '<div class="loader"></div> Generating...';
  out.classList.remove("empty"); out.innerHTML = "Generating notes...";

  const styleMap = {
    detailed: "comprehensive detailed notes with examples",
    bullet:   "concise bullet point notes",
    summary:  "a brief 200-word summary",
    exam:     "exam-focused key points and formulas"
  };

  try {
    await streamAI(
      "You are an expert educator for Indian college students. Generate clear, well-structured notes using headings and bullet points. Use **bold** for key terms.",
      `Generate ${styleMap[style]} on: ${topic}`,
      out
    );
    bumpUsage("notes");
    showToast("Notes generated!", "success");
  } catch (e) { out.textContent = "Error: " + e.message; showToast("Failed", "danger"); }
  btn.disabled = false; btn.innerHTML = '<i class="ti ti-wand"></i> Generate Notes';
}

// ===== IMAGE GEN =====
function addTag(tag) {
  const i = document.getElementById("imgPrompt");
  i.value = i.value ? i.value + ", " + tag : tag;
}

async function generateImage() {
  const prompt = document.getElementById("imgPrompt").value.trim();
  const style  = document.getElementById("imgStyle").value;
  const btn    = document.getElementById("imgBtn");
  const out    = document.getElementById("imgOutput");
  if (!prompt) { showToast("Please describe the image", "warning"); return; }
  if (!checkLimit("images")) return;

  btn.disabled = true; btn.innerHTML = '<div class="loader"></div> Generating...';
  out.innerHTML = '<div class="output-box" style="text-align:center;padding:28px;color:var(--text-light)"><i class="ti ti-photo-ai" style="font-size:38px;color:var(--primary);display:block;margin-bottom:10px"></i>Creating your image with Gemini AI...</div>';

  const stylePrompts = {
    realistic: "photorealistic, hyperdetailed, 8k ultra realistic",
    artistic:  "oil painting, artistic, painterly, fine art",
    anime:     "anime style, manga, vibrant colors, Japanese animation",
    "3d":      "3D render, octane render, studio lighting, CGI",
    sketch:    "pencil sketch, detailed line art, hand drawn"
  };

  const fullPrompt = `${prompt}, ${stylePrompts[style] || "high quality, detailed"}`;

  try {
    // Try Gemini image generation first
    const res = await fetch(`${BACKEND}/api/ai/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt })
    });
    const data = await res.json();

    if (data.result && !data.fallback) {
      // Gemini returned a base64 image
      out.innerHTML = "";
      const wrap = document.createElement("div"); wrap.className = "img-result";
      const img = new Image();
      img.style.cssText = "width:100%;display:block;border-radius:12px";
      img.src = data.result;
      wrap.appendChild(img);
      out.appendChild(wrap);

      // Download button
      const dl = document.createElement("a");
      dl.href = data.result; dl.download = "nexora-image.png";
      dl.innerHTML = '<button class="run-btn" style="margin-top:10px"><i class="ti ti-download"></i> Download Image</button>';
      out.appendChild(dl);

      const badge = document.createElement("div");
      badge.style.cssText = "font-size:11px;color:var(--text-light);margin-top:6px;text-align:center";
      badge.innerHTML = '✨ Generated by <strong>Gemini AI</strong>';
      out.appendChild(badge);

      bumpUsage("images");
      showToast("Image generated with Gemini AI!", "success");
    } else {
      // Fallback to Pollinations if Gemini fails
      throw new Error(data.error || "Gemini unavailable");
    }
  } catch (err) {
    console.warn("Gemini image gen failed, using Pollinations fallback:", err.message);
    showToast("Using fallback image engine...", "info");

    const encodedPrompt = encodeURIComponent(fullPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    const imgUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=512&seed=${seed}&nologo=true`;

    const img = new Image();
    img.onload = () => {
      out.innerHTML = "";
      const wrap = document.createElement("div"); wrap.className = "img-result";
      img.style.cssText = "width:100%;display:block;border-radius:12px";
      wrap.appendChild(img); out.appendChild(wrap);
      const dl = document.createElement("a"); dl.href = imgUrl; dl.target = "_blank";
      dl.innerHTML = '<button class="run-btn" style="margin-top:10px"><i class="ti ti-download"></i> Open Full Image</button>';
      out.appendChild(dl);
      bumpUsage("images");
      showToast("Image generated!", "success");
      btn.disabled = false; btn.innerHTML = '<i class="ti ti-photo"></i> Generate Image';
    };
    img.onerror = () => {
      out.innerHTML = '<div class="output-box empty">Image generation failed. Try a different prompt.</div>';
      btn.disabled = false; btn.innerHTML = '<i class="ti ti-photo"></i> Generate Image';
      showToast("Image failed", "danger");
    };
    img.src = imgUrl;
    return;
  }

  btn.disabled = false; btn.innerHTML = '<i class="ti ti-photo"></i> Generate Image';
}

// ===== RESUME =====
async function generateResume() {
  const name  = document.getElementById("rName").value.trim();
  const title = document.getElementById("rTitle").value.trim();
  const btn   = document.getElementById("resumeBtn");
  const out   = document.getElementById("resumeOutput");
  if (!name || !title) { showToast("Name and job title required", "warning"); return; }

  btn.disabled = true; btn.innerHTML = '<div class="loader"></div> Building...';
  out.classList.remove("empty"); out.innerHTML = "Building resume...";

  const userData = {
    name,
    email:      document.getElementById("rEmail").value,
    phone:      document.getElementById("rPhone").value,
    location:   document.getElementById("rLocation").value,
    linkedin:   document.getElementById("rLinkedIn").value,
    degree:     title,
    skills:     document.getElementById("rSkills").value,
    projects:   "",
    experience: document.getElementById("rExperience").value,
    achievements: "",
    objective:  document.getElementById("rSummary").value,
    college:    document.getElementById("rEducation").value
  };

  try {
    const res  = await fetch(`${BACKEND}/api/ai/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userData })
    });
    const data = await res.json();
    if (!data.result) throw new Error("No result");
    out.innerHTML = '<div class="resume-preview">' + data.result + "</div>";
    showToast("Resume generated!", "success");
  } catch (e) { out.textContent = "Error: " + e.message; showToast("Failed", "danger"); }
  btn.disabled = false; btn.innerHTML = '<i class="ti ti-wand"></i> Generate Resume';
}

// ===== MOCK TEST =====
async function generateTest() {
  const subject    = document.getElementById("testSubject").value.trim();
  const difficulty = document.getElementById("testDifficulty").value;
  const count      = document.getElementById("testCount").value;
  const btn        = document.getElementById("testBtn");
  const out        = document.getElementById("testOutput");
  if (!subject) { showToast("Please enter a subject", "warning"); return; }

  btn.disabled = true; btn.innerHTML = '<div class="loader"></div> Generating...';
  out.classList.remove("empty"); out.innerHTML = "Generating test...";

  try {
    const result = await callAI(
      "You are an expert educator for Indian college students. Create well-structured MCQ tests. Format each question as: Q: [question] A: [opt1] B: [opt2] C: [opt3] D: [opt4] ANS: [letter]. Separate questions with ---.",
      `Generate a ${difficulty} difficulty mock test with ${count} MCQ questions on: ${subject}. List correct answers at the end.`
    );
    out.innerHTML = formatText(result);
    showToast("Test generated!", "success");
  } catch (e) { out.textContent = "Error: " + e.message; showToast("Failed", "danger"); }
  btn.disabled = false; btn.innerHTML = '<i class="ti ti-wand"></i> Generate Test';
}

// ===== PLANNER =====
async function createPlan() {
  const goal = document.getElementById("planGoal").value.trim();
  const btn  = document.getElementById("planBtn");
  const out  = document.getElementById("planOutput");
  if (!goal) { showToast("Please enter your goal", "warning"); return; }

  btn.disabled = true; btn.innerHTML = '<div class="loader"></div> Planning...';
  out.classList.remove("empty"); out.innerHTML = "Creating study plan...";

  const prompt = `Create a detailed study plan:
Goal: ${goal}
Start: ${document.getElementById("planStartDate").value || "Today"} | End: ${document.getElementById("planEndDate").value || "3 months"}
Hours/day: ${document.getElementById("planHours").value}
Subjects: ${document.getElementById("planSubjects").value || "all relevant"}
Create a week-by-week plan with daily schedules, priorities, and milestones.`;

  try {
    await streamAI(
      "You are an expert study coach for Indian college students. Create personalized, realistic study plans with clear weekly breakdowns.",
      prompt,
      out
    );
    showToast("Plan created!", "success");
  } catch (e) { out.textContent = "Error: " + e.message; showToast("Failed", "danger"); }
  btn.disabled = false; btn.innerHTML = '<i class="ti ti-wand"></i> Create Plan';
}

// ===== CHARTS =====
let chartsLoaded   = false;
let analyticsLoaded = false;

function loadCharts() {
  if (chartsLoaded) return; chartsLoaded = true;
  const w = document.getElementById("weeklyChart");
  if (w) new Chart(w, { type:"line", data:{ labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], datasets:[{ label:"Activity", data:[2,3,4,5,3,6,7], borderColor:"#6C63FF", backgroundColor:"rgba(108,99,255,.1)", tension:.4, fill:true }] }, options:{ responsive:true, plugins:{ legend:{ display:false } } } });
  const u = document.getElementById("usageChart");
  if (u) new Chart(u, { type:"doughnut", data:{ labels:["Chat","Notes","Images","Tests"], datasets:[{ data:[35,25,20,20], backgroundColor:["#6C63FF","#8B5CF6","#EC4899","#10B981"] }] }, options:{ responsive:true } });
}

function loadAnalyticsCharts() {
  if (analyticsLoaded) return; analyticsLoaded = true;
  const m = document.getElementById("monthlyChart");
  if (m) new Chart(m, { type:"bar", data:{ labels:["Jan","Feb","Mar","Apr","May","Jun"], datasets:[{ label:"Hours", data:[28,35,42,38,50,47], backgroundColor:"rgba(108,99,255,.7)", borderRadius:7 }] }, options:{ responsive:true } });
  const s = document.getElementById("subjectChart");
  if (s) new Chart(s, { type:"radar", data:{ labels:["Maths","Physics","Chemistry","English","CS"], datasets:[{ label:"Score %", data:[85,72,90,78,95], borderColor:"#6C63FF", backgroundColor:"rgba(108,99,255,.1)" }] }, options:{ responsive:true } });
}

// ===== TOAST =====
function showToast(msg, type = "info") {
  const icons  = { success:"ti-circle-check", warning:"ti-alert-triangle", danger:"ti-circle-x", info:"ti-info-circle" };
  const colors = { success:"var(--success)", warning:"var(--warning)", danger:"var(--danger)", info:"var(--primary)" };
  const t = document.createElement("div"); t.className = "toast";
  t.innerHTML = `<i class="ti ${icons[type]}" style="color:${colors[type]}"></i> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 50);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 3000);
}

// ===== INIT =====
window.addEventListener("load", () => {
  const saved = localStorage.getItem("nexora-theme");
  if (saved === "dark") { darkMode = true; document.body.classList.add("dark"); document.getElementById("themeIcon").className = "ti ti-moon"; }
  const session = localStorage.getItem("nexora-session");
  if (session) { try { const s = JSON.parse(session); currentUser = { email: s.email, name: s.name }; if (s.token) localStorage.setItem("nexora-token", s.token); loadUserData(); enterApp(); } catch (e) {} }
  document.getElementById("planStartDate").valueAsDate = new Date();
  const end = new Date(); end.setMonth(end.getMonth() + 3);
  document.getElementById("planEndDate").valueAsDate = end;
});