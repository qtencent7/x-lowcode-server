const request = require("../../../../utils/request");
const { generateToken } = require("../utils/zhiputoken");

class ZhipuAI {
    constructor(apiKey) {
      if (!apiKey) {
        throw new Error("API Key is required");
      }
      this.apiKey = apiKey;
      this.cacheToken = true;
      this.baseUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    }
  
    async createCompletion(params) {
      if (!params.model) {
        throw new Error("Model name is required");
      }
      if (!params.messages || !Array.isArray(params.messages)) {
        throw new Error("Messages array is required");
      }
      const token = await generateToken(this.apiKey, this.cacheToken);
      const headers = {
        baseUrl: this.baseUrl,
        Authorization: token,
        timeout: 10000,
      };
  
      try {
        const response = await request.post(this.baseUrl, JSON.stringify(params), { headers });
        return response.data;
      } catch (error) {
        console.error("Error calling ZhipuAI API:", error.response?.data || error.message);
        throw error;
      }
    }
  }

module.exports = ZhipuAI;