import apiClient from './apiClient';

// Get all quizzes
export const getQuizzes = async () => {
  return apiClient.get('/quizzes');
};

export const getQuizById = async (quizId) => {
  return apiClient.get(`/quizzes/${quizId}`);
};

const generateQuizInternal = async (quizParams) => {
  const payload = {
    prompt: quizParams.topic,
    title: quizParams.topic,
    max_questions: quizParams.num_questions
  };
  return apiClient.post('/generate-quiz', payload);
};

export const fetchGeneratedQuiz = generateQuizInternal;
export const generateQuiz = generateQuizInternal;

export const saveQuiz = async (quizData) => {
  return apiClient.post('/quizzes', quizData);
};

export const submitQuiz = async (quizId, answers) => {
  return apiClient.post(`/quizzes/${quizId}/submit`, { answers });
};

export const deleteQuiz = async (quizId) => {
  return apiClient.delete(`/quizzes/${quizId}`);
};

// --- NEW: Save Score Function ---
export const saveScore = async (quizId, score) => {
    // score is a number (e.g., 80.5)
    return apiClient.post(`/quizzes/${quizId}/score`, { score });
}