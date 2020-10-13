package org.affid;

import java.util.ArrayList;

public class Color {
    private final int r;
    private final int g;
    private final int b;

    public static Color red = new Color(255, 0, 0);
    public static Color green = new Color(0, 255, 0);
    public static Color blue = new Color(0, 0, 255);
    public static Color sky = new Color(66 , 170, 255);
    public static Color magenta = new Color(255, 0, 255);
    public static Color yellow = new Color(255, 255, 0);
    public static Color orange = new Color(255, 165, 0);
    public static Color white = new Color(255, 255, 255);
    public static Color black = new Color(0, 0, 0);

    public Color(int r, int g, int b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public static ArrayList<Color> getGradient(Color start, Color end, int steps) {
        ArrayList<Color> gradient = new ArrayList<>();
        Color diff = end.difference(start);
        Color step = new Color(diff.r / steps, diff.g / steps, diff.b / steps);
        for (int i = 0; i < steps; i++) {
            gradient.add(start.add(step.multiply(i)));
        }
        return gradient;
    }

    public Color add(Color color) {
        return new Color(Math.min(this.r + color.r, 255), Math.min(this.g + color.g, 255), Math.min(this.b + color.b, 255));
    }

    private Color multiply(int scale) {
        return new Color(this.r * scale, this.g * scale, this.b * scale);
    }

    private Color difference(Color color) {
        return new Color(this.r - color.r, this.g - color.g, this.b - color.b);
    }

    public int getR() {
        return r;
    }

    public int getG() {
        return g;
    }

    public int getB() {
        return b;
    }

    @Override
    public String toString() {
        return String.format("rgb(%d, %d, %d)", r, g, b);
    }
}
