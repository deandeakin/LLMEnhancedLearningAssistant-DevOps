package com.deankennedy.llmenhancedlearningapp.utils;

import com.deankennedy.llmenhancedlearningapp.data.TaskHistory;

import java.util.List;

public class LearningStatsCalculator {

    public static LearningStats calculate(List<TaskHistory> historyList) {
        int totalQuestionsAnswered = 0;
        int correctlyAnswered = 0;
        int incorrectlyAnswered = 0;

        for (TaskHistory history : historyList) {
            if ("submit".equals(history.getUtilityUsed())) {
                String selectedAnswer = history.getSelectedAnswer();
                String correctAnswer = history.getCorrectAnswer();

                if (selectedAnswer != null && correctAnswer != null) {
                    totalQuestionsAnswered++;

                    if (selectedAnswer.trim().equals(correctAnswer.trim())) {
                        correctlyAnswered++;
                    } else {
                        incorrectlyAnswered++;
                    }
                }
            }
        }

        return new LearningStats(
                totalQuestionsAnswered,
                correctlyAnswered,
                incorrectlyAnswered
        );
    }

    public static class LearningStats {
        private final int totalQuestionsAnswered;
        private final int correctlyAnswered;
        private final int incorrectlyAnswered;

        public LearningStats(int totalQuestionsAnswered,
                             int correctlyAnswered,
                             int incorrectlyAnswered) {
            this.totalQuestionsAnswered = totalQuestionsAnswered;
            this.correctlyAnswered = correctlyAnswered;
            this.incorrectlyAnswered = incorrectlyAnswered;
        }

        public int getTotalQuestionsAnswered() {
            return totalQuestionsAnswered;
        }

        public int getCorrectlyAnswered() {
            return correctlyAnswered;
        }

        public int getIncorrectlyAnswered() {
            return incorrectlyAnswered;
        }
    }
}
