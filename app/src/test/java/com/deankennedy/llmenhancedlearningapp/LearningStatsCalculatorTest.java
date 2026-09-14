package com.deankennedy.llmenhancedlearningapp;

import com.deankennedy.llmenhancedlearningapp.data.TaskHistory;
import com.deankennedy.llmenhancedlearningapp.utils.LearningStatsCalculator;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class LearningStatsCalculatorTest {

    private TaskHistory createHistory(
            String selectedAnswer,
            String correctAnswer,
            String utilityUsed) {

        return new TaskHistory(
                "Dean",
                "Data Structures",
                "Example question",
                selectedAnswer,
                correctAnswer,
                utilityUsed,
                "",
                "",
                System.currentTimeMillis()
        );
    }

    @Test
    public void calculate_countsCorrectAndIncorrectSubmittedAnswers() {
        List<TaskHistory> history = Arrays.asList(
                createHistory("Stack", "Stack", "submit"),
                createHistory("Queue", "Stack", "submit"),
                createHistory("Tree", "Tree", "submit")
        );

        LearningStatsCalculator.LearningStats stats =
                LearningStatsCalculator.calculate(history);

        assertEquals(3, stats.getTotalQuestionsAnswered());
        assertEquals(2, stats.getCorrectlyAnswered());
        assertEquals(1, stats.getIncorrectlyAnswered());
    }

    @Test
    public void calculate_ignoresNonSubmitHistory() {
        List<TaskHistory> history = Arrays.asList(
                createHistory("Stack", "Stack", "submit"),
                createHistory(null, "Stack", "hint"),
                createHistory("Queue", "Queue", "explain")
        );

        LearningStatsCalculator.LearningStats stats =
                LearningStatsCalculator.calculate(history);

        assertEquals(1, stats.getTotalQuestionsAnswered());
        assertEquals(1, stats.getCorrectlyAnswered());
        assertEquals(0, stats.getIncorrectlyAnswered());
    }

    @Test
    public void calculate_trimsWhitespaceBeforeComparingAnswers() {
        List<TaskHistory> history = Arrays.asList(
                createHistory("  Stack  ", "Stack", "submit")
        );

        LearningStatsCalculator.LearningStats stats =
                LearningStatsCalculator.calculate(history);

        assertEquals(1, stats.getTotalQuestionsAnswered());
        assertEquals(1, stats.getCorrectlyAnswered());
        assertEquals(0, stats.getIncorrectlyAnswered());
    }
}