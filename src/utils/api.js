const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getApiBaseUrl() {
  const saved = localStorage.getItem("research_agent_api_base");
  const envUrl = import.meta.env.VITE_API_URL;
  let url = saved || DEFAULT_API_BASE;
  
  if (envUrl) {
    if (!saved || saved === "http://localhost:8000" || saved === "http://127.0.0.1:8000") {
      url = envUrl;
    }
  }
  
  // Sanitize and auto-correct the URL
  url = url.trim();
  if (url) {
    // 1. Ensure it starts with http:// or https://
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      if (url.includes("localhost") || url.includes("127.0.0.1")) {
        url = "http://" + url;
      } else {
        url = "https://" + url;
      }
    }
    // 2. Strip any trailing slashes
    while (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
  }
  
  return url;
}

export function setApiBaseUrl(url) {
  localStorage.setItem("research_agent_api_base", url);
}

export async function queryResearchAgent(prompt, userId, openaiKey, tavilyKey, files, llmBaseUrl, llmModel, modelTier = "FREE") {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  
  formData.append("prompt", prompt);
  formData.append("user_id", userId);
  if (openaiKey) formData.append("openai_key", openaiKey);
  if (tavilyKey) formData.append("tavily_key", tavilyKey);
  if (llmBaseUrl) formData.append("llm_base_url", llmBaseUrl);
  if (llmModel) formData.append("llm_model", llmModel);
  formData.append("model_tier", modelTier);
  
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
  }
  
  const response = await fetch(`${baseUrl}/api/query`, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to execute agent pipeline");
  }
  
  return await response.json();
}

export async function getUserProfile(userId) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/profile/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to load user memory profile");
  }
  return await response.json();
}

export async function updateUserProfile(userId, profileData) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/profile/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error("Failed to update user memory profile");
  }
  return await response.json();
}

export async function getUserDocuments(userId) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/documents/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to load documents list");
  }
  return await response.json();
}

export async function deleteDocument(userId, docId) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/documents/${userId}/${docId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
  return await response.json();
}

export async function clearUserData(userId) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/profile/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to wipe user data");
  }
  return await response.json();
}

// Skills API Helpers
export async function getUserSkills(userId) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/skills/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user skills");
  return await response.json();
}

export async function toggleUserSkill(userId, skillId, enabled) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/skills/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, item_id: skillId, enabled }),
  });
  if (!response.ok) throw new Error("Failed to toggle skill");
  return await response.json();
}

// Plugins API Helpers
export async function getUserPlugins(userId) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/plugins/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user plugins");
  return await response.json();
}

export async function toggleUserPlugin(userId, pluginId, enabled) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/plugins/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, item_id: pluginId, enabled }),
  });
  if (!response.ok) throw new Error("Failed to toggle plugin");
  return await response.json();
}

export async function authUserPlugin(userId, pluginId, authData) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/plugins/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, plugin_id: pluginId, auth_data: authData }),
  });
  if (!response.ok) throw new Error("Failed to save plugin auth");
  return await response.json();
}

export async function uploadLocalSkill(userId, file) {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);
  
  const response = await fetch(`${baseUrl}/api/skills/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload local skill");
  }
  return await response.json();
}

export async function uploadLocalPlugin(userId, file) {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);
  
  const response = await fetch(`${baseUrl}/api/plugins/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload local plugin");
  }
  return await response.json();
}
