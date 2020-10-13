package org.affid;

public interface Coordinate{

    float getZ();

    void setZ(float x) ;

    float getX();

    void setX(float x) ;

    float getY();

    void setY(float y);

    String toString();

    Coordinate subtract(Coordinate c);

    Coordinate add(Coordinate c);

    Coordinate unit();

    float length();

    float distance(Coordinate c);

    Coordinate scale(float k);
}
