// 三国志探险 - 20章答题（按三国演义小说章节顺序）
// 每章10题，共200题，难度递增
// 由 quizzes-part1.js 和 quizzes-part2.js 合并

import { quizzesPart1 } from './quizzes-part1.js';
import { quizzesPart2 } from './quizzes-part2.js';

export const quizzes = [...quizzesPart1, ...quizzesPart2];

export function getQuiz(id) {
  return quizzes.find(q => q.id === id);
}
