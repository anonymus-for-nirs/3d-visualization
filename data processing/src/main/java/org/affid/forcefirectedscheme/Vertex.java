package org.affid.forcefirectedscheme;

public class Vertex {
    Point pos;
    Point disp;

    public Vertex(Point coordinates) {
        this.pos = coordinates;
        this.disp = new Point(0,0,0);
    }

    public Point getPos() {
        return pos;
    }
}
