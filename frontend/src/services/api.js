import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

export const api = {
  // Health & Provider Info
  async checkHealth() {
    const res = await axios.get('http://localhost:5000/health');
    return res.data;
  },

  // Sample Benchmarks
  async getSampleInputs() {
    const res = await client.get('/lessons/sample-inputs');
    return res.data.samples || [];
  },

  // Lessons CRUD & Generation
  async generateLesson(payload) {
    const res = await client.post('/lessons/generate', payload);
    return res.data.lesson;
  },

  async getLessons() {
    const res = await client.get('/lessons');
    return res.data.lessons || [];
  },

  async getLesson(id) {
    const res = await client.get(`/lessons/${id}`);
    return res.data.lesson;
  },

  async updateLesson(id, payload) {
    const res = await client.put(`/lessons/${id}`, payload);
    return res.data.lesson;
  },

  async deleteLesson(id) {
    const res = await client.delete(`/lessons/${id}`);
    return res.data;
  },

  // Apply QC recommendation fix
  async applyQCRecommendation(lessonId, fixId, layer) {
    const res = await client.post(`/lessons/${lessonId}/apply-qc`, {
      fix_id: fixId,
      layer: layer,
    });
    return res.data;
  },

  // QC Endpoints
  async runQCLayer1(lessonId) {
    const res = await client.post('/qc/layer1', { lesson_id: lessonId });
    return res.data.qc_layer_1;
  },

  async runQCLayer2(lessonId) {
    const res = await client.post('/qc/layer2', { lesson_id: lessonId });
    return res.data.qc_layer_2;
  },

  async rerunBothQC(lessonId) {
    const res = await client.post('/qc/both', { lesson_id: lessonId });
    return res.data.lesson;
  },

  // Research Endpoints
  async conductResearch(title, objective) {
    const res = await client.post('/research', {
      title,
      learning_objective: objective,
    });
    return res.data.research;
  },

  async retryResearch(lessonId) {
    const res = await client.post('/research/retry', { lesson_id: lessonId });
    return res.data.lesson;
  },

  // Export URLs
  getExportUrl(lessonId, format) {
    return `${API_BASE_URL}/lessons/${lessonId}/export/${format}`;
  },

  async exportLessonFile(lessonId, format) {
    const url = this.getExportUrl(lessonId, format);
    window.open(url, '_blank');
  },
};

export default api;

