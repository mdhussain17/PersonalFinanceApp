package com.budgetwise.backend.ai.ai;

/**
 * A simple mathematical model to calculate the "Line of Best Fit"
 * (y = mx + b) for predicting future values based on history.
 */
public class SimpleLinearRegression {
    private final double intercept; // 'b'
    private final double slope;     // 'm'

    // Constructor is private to force usage of the factory method 'fit'
    private SimpleLinearRegression(double intercept, double slope) {
        this.intercept = intercept;
        this.slope = slope;
    }

    /**
     * Trains the model using historical data arrays.
     * This method MUST be 'public static' so it can be called from your service.
     * * @param x Array of time indices (e.g., 0, 1, 2, 3, 4, 5)
     * @param y Array of expense amounts
     */
    public static SimpleLinearRegression fit(double[] x, double[] y) {
        if (x.length != y.length) {
            throw new IllegalArgumentException("Array lengths must match");
        }
        if (x.length < 2) {
            // Not enough data to calculate slope, return a flat line
            double mean = 0;
            if (y.length > 0) {
                for (double val : y) mean += val;
                mean /= y.length;
            }
            return new SimpleLinearRegression(mean, 0);
        }

        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        int n = x.length;

        for (int i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
        }

        double denominator = (n * sumX2 - sumX * sumX);
        if (denominator == 0) {
            // Vertical line case, return flat line average
             double mean = 0;
             for (double val : y) mean += val;
             mean /= n;
             return new SimpleLinearRegression(mean, 0);
        }

        double slope = (n * sumXY - sumX * sumY) / denominator;
        double intercept = (sumY - slope * sumX) / n;

        return new SimpleLinearRegression(intercept, slope);
    }

    /**
     * Predicts the amount (y) for a future month (x).
     */
    public double predict(double x) {
        double result = slope * x + intercept;
        // Expenses cannot be negative
        return Math.max(0, result); 
    }
}