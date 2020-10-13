import spheres from '../resources/spheres.js';
import authors from '../resources/authors.js';
import papers from '../resources/papers.js';
import  titles from '../resources/titles.js';

export function getSpheres() {
    return spheres;
}

export function getLinkerSpheres(sphereDOI) {
    const linkers = [];
    for (let currSphereDOI in spheres) {
        if (spheres[currSphereDOI]['links'].includes(sphereDOI)) {
            linkers.push(currSphereDOI);
        }
    }

    return linkers;
}

export function getLinkSpheres(sphereDOI) {
    return spheres[sphereDOI]['links'];
}

export function getArticleName(sphereDOI) {
    return papers[sphereDOI]['name'];
}

export function openLinkInBrowser(sphereDOI) {
    const link = papers[sphereDOI]['link'];
    window.open(link,'_blank');
}

export function searchArticle(article) {
    const paperNames = Object.keys(titles);
    return fuzzysort.go(article, paperNames);
}

export function searchAuthor(author) {
    const authorsArray = [];
    for (let id in authors) {
        authorsArray.push(id + ' : ' + authors[id]);
    }
    return fuzzysort.go(author, authorsArray);
}

export function getSpheresByAuthor(author) {
    const authorID = Number(author.slice(0, author.indexOf(' : ')));
    let spheres = [];
    for (let sphereDOI in papers) {
        if (papers[sphereDOI]['authors'].includes(authorID)) {   
            spheres.push(sphereDOI);
        }
    }

    return spheres;
}