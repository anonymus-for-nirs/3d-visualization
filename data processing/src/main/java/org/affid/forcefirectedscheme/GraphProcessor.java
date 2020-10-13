package org.affid.forcefirectedscheme;

import org.affid.Coordinate;

import java.util.ArrayList;
import java.util.Collection;

public class GraphProcessor {

    private final float k;
    private float temperature;
    private final Collection<Vertex> vertices;
    private final Collection<Edge> edges;
    private final ArrayList<Integer> space;

    public GraphProcessor(Collection<Vertex> vertices, Collection<Edge> edges, ArrayList<Integer> space, float C, float temperature) {
        this.temperature = temperature;
        this.k = C * 2.3f;
        this.vertices = vertices;
        this.edges = edges;
        this.space = space;
    }

    public void makeLayout(int iterations) {

        for (int i = 0; i < iterations; i++) {
            //вычисление сил отталкивания
            for (Vertex v : vertices) {
                //у каждой вершины есть два вектора - pos(позиция) и disp(перемещение)
                v.disp = new Point(0, 0, 0);
                for (Vertex u : vertices) {
                    if (!u.equals(v)) {
                        Coordinate delta = v.pos.subtract(u.pos);
                        v.disp = (Point) v.disp.add(delta.unit().scale(forceR(delta.length())));
                    }
                }
            }

            //вычисление сил притяжения
            for (Edge e : edges) {
                Coordinate delta = e.getDelta();
                e.b.disp = (Point) e.b.disp.add(delta.unit().scale(forceA(delta.length())));
                e.a.disp = (Point) e.a.disp.subtract(delta.unit().scale(forceA(delta.length())));
            }

            //ограничение максимального перемещения величиной температуры
            //предотвращения выхода за границы пространства
            for (Vertex v : vertices) {
                v.pos = (Point) v.pos.add(v.disp.unit().scale(Math.min(v.disp.length(), temperature)));
                v.pos.setX(Math.min(space.get(0), Math.max(-space.get(0), v.pos.getX())));
                v.pos.setY(Math.min(space.get(1), Math.max(-space.get(1), v.pos.getY())));
                if (space.size() == 3)
                    v.pos.setZ(Math.min(space.get(2), Math.max(-space.get(2), v.pos.getZ())));
            }

            //уменьшение температуры по мере приближения к конечному размещению графа
            temperature = cool(temperature);
        }
    }

    private float forceA(float distance) {
        return distance * distance / k;
    }

    private float forceR(float distance) {
        return (k * k / distance) * u(2f * k - distance);
    }

    private static float cool(float t) {
        return (float) (t * 0.9);
    }

    private int u(float x) {
        return x > 0 ? 1 : 0;
    }

}
