export function normalizeQuizContent(content) {
  if (!content) {
    return [];
  }

  let parsed = content;

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && Array.isArray(parsed.questions)) {
    return parsed.questions;
  }

  if (parsed && Array.isArray(parsed.data)) {
    return parsed.data;
  }

  return [];
}

export function getQuestionLabel(question, index) {
  return question?.text || question?.question || question?.question_text || `Question ${index + 1}`;
}

export function isCorrectAnswer(question, selectedIndex) {
  const options = Array.isArray(question?.options) ? question.options : [];
  const selectedOption = options[selectedIndex];

  if (selectedOption && typeof selectedOption === 'object') {
    if (selectedOption.is_correct === true || selectedOption.correct === true) {
      return true;
    }
  }

  const answer = question?.answer;
  if (answer === undefined || answer === null) {
    return false;
  }

  if (Number(answer) === selectedIndex) {
    return true;
  }

  const selectedText = typeof selectedOption === 'string'
    ? selectedOption
    : selectedOption?.text || selectedOption?.answer || selectedOption?.choice || selectedOption?.label || selectedOption?.value || '';

  if (String(answer).trim() === String(selectedText).trim()) {
    return true;
  }

  const letterMap = ['A', 'B', 'C', 'D', 'E', 'F'];
  const normalizedAnswer = String(answer).trim().toUpperCase();
  if (letterMap.includes(normalizedAnswer)) {
    return letterMap.indexOf(normalizedAnswer) === selectedIndex;
  }

  return false;
}
