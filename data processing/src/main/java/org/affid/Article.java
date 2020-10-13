package org.affid;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.util.ArrayList;

@JsonPropertyOrder({"authors", "name", "year", "rate", "doi", "link", "refs"})
public class Article {
    private final ArrayList<Long> authors;
    private final String name;
    private final String year;
    private int rate;
    private final String DOI;
    private final String link;
    private ArrayList<String> refs;


    public String getYear() {
        return year;
    }

    public Article(ArrayList<Long> authors, String name,
                   String year, int rate, String DOI,
                   String link, ArrayList<String> refs) {
        this.authors = authors;
        this.name = name;
        this.year = year;
        this.rate = rate;
        this.DOI = DOI;
        this.link = link;
        this.refs = refs;
    }

    public ArrayList<Long> getAuthors() {
        return authors;
    }

    public String getName() {
        return name;
    }

    public int getRate() {
        return rate;
    }

    public String getDOI() {
        return DOI;
    }

    public String getLink() {
        return link;
    }

    public ArrayList<String> getRefs() {
        return refs;
    }

    public void setRate(int rate) {
        this.rate = rate;
    }

    public void setRefs(ArrayList<String> refs) {
        this.refs = refs;
    }
}
