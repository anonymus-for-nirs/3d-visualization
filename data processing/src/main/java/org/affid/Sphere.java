package org.affid;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.util.ArrayList;

@JsonPropertyOrder({"weight", "x", "y", "z", "color", "links"})
public class Sphere {
    private final double weight;
    private double x;
    private double y;
    private double z;
    private final ArrayList<String> links;
    private final Color color;

    public String getColor() {
        return color.toString();
    }

    public double getWeight() {
        return weight;
    }

    public void setX(double x) {
        this.x = x;
    }

    public void setY(double y) {
        this.y = y;
    }

    public void setZ(double z) {
        this.z = z;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getZ() {
        return z;
    }

    public ArrayList<String> getLinks() {
        return links;
    }

    public Sphere(double weight, int x, int y, int z, ArrayList<String> links, Color color) {
        this.weight = weight;
        this.x = x;
        this.y = y;
        this.z = z;
        this.links = links;
        this.color = color;
    }

    public Sphere(double weight, double edge, ArrayList<String> links, Color color) {
        this.weight = weight;
        this.x = Main.getRandom(edge);
        this.y = Main.getRandom(edge);
        this.z = Main.getRandom(edge);
        this.links = links;
        this.color = color;
    }
}
