const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const firebase = require('firebase');
const admin = require('firebase-admin');

admin.initializeApp();

const imdbTop50Url = 'https://www.imdb.com/search/title/?groups=top_100&sort=user_rating,desc'

const imdbNext50Url = 'https://www.imdb.com/search/title/?groups=top_100&sort=user_rating,desc&start=51&ref_=adv_nxt'

const fetchHTML = async (url) => {
    const resp = await axios.get(url);
    return cheerio.load(resp.data)
}

const config = {
    apiKey: "AIzaSyBEXsHvKsaI10rrdL9SX8qi1KpOR02wRqQ",
    authDomain: "top100movies-b3261.firebaseapp.com",
    projectId: "top100movies-b3261",
    storageBucket: "top100movies-b3261.appspot.com",
    messagingSenderId: "510097366104",
    appId: "1:510097366104:web:8a31098ce2d7303e67be2d"
};

firebase.initializeApp(config);
  
var db = firebase.firestore();

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto("https://www.imdb.com/search/title/?groups=top_100&sort=user_rating,desc&start=51&ref_=adv_nxt", { waitUntil: 'networkidle0' });
    await autoScroll(page);
    await page.waitForTimeout(7000)

    const content2 = await page.content();

    const next = cheerio.load(content2);
    const nextmovies = next('div.lister-item');

    nextmovies.each((i, element) => {
        const moviee = next(element);

        const title = moviee.find('.lister-item-header > a').text();
        const poster = moviee.find('.lister-item-image > a > img.loadlate').attr('src');
        const description = moviee.find('.lister-item-content > p:nth-child(4)').text()

        db.collection("top100").add({
            title: {title},
            poster: {poster},
            desc: {description}
        })
            .then(function () {
                console.log("Document successfully written!");
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    })
    await browser.close();
})();

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto("https://www.imdb.com/search/title/?groups=top_100&sort=user_rating,desc", { waitUntil: 'networkidle0' });
    await autoScroll(page);
    await page.waitForTimeout(7000)

    const content = await page.content();

    const $ = cheerio.load(content);
    const movies = $('div.lister-item');

    movies.each((i, element) => {
        const movie = $(element);

        const title = movie.find('.lister-item-header > a').text();
        const poster = movie.find('.lister-item-image > a > img').attr('src');
        const description = movie.find('.lister-item-content > p:nth-child(4)').text()

        db.collection("top100").add({
            title: {title},
            poster: {poster},
            desc: {description}
        })
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
        
    })

    await browser.close();

})();
