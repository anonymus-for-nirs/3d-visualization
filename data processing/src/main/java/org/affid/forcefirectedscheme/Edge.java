package org.affid.forcefirectedscheme;

import org.affid.Coordinate;

public class Edge {
    Vertex a;
    Vertex b;

    public Edge(Vertex a, Vertex b) {
        this.a = a;
        this.b = b;
    }

    public Coordinate getDelta(){
        return a.pos.subtract(b.pos);
    }

}
