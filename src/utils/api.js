const DEFAULT_API_BASE = "http://localhost:8000";

export function getApiBaseUrl() {
  const saved = localStorage.getItem("research_agent_api_base");
  return saved || DEFAULT_API_BASE;
}

export function setApiBaseUrl(url) {
  localStorage.setItem("research_agent_api_base", url);
}

export async function queryResearchAgent(prompt, userId, openaiKey, tavilyKey, files, llmBaseUrl, llmModel) {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  
  formData.append("prompt", prompt);
  formData.append("user_id", userId);
  if (openaiKey) formData.append("openai_key", openaiKey);
  if (tavilyKey) formData.append("tavily_key", tavilyKey);
  if (llmBaseUrl) formData.append("llm_base_url", llmBaseUrl);
  if (llmModel) formData.append("llm_model", llmModel);
  
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
