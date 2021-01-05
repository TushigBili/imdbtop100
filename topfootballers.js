const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const firebase = require('firebase');
const admin = require('firebase-admin');

admin.initializeApp();

// const imdbTop50Url = 'https://www.imdb.com/search/title/?groups=top_100&sort=user_rating,desc'

// const imdbNext50Url = 'https://www.imdb.com/search/title/?groups=top_100&sort=user_rating,desc&start=51&ref_=adv_nxt'

// const fetchHTML = async (url) => {
//     const resp = await axios.get(url);
//     return cheerio.load(resp.data)
// }

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

    await page.goto("https://www.goal.com/en/lists/ballon-dor-2020-power-rankings/whcizarhekx113s80lap7bhcr#2wogc9lkvu371rjg9sbv3lhwc", { waitUntil: 'networkidle0' });
    await page.waitForTimeout(7000)
    await autoScroll(page);

    await page.screenshot({path: './webpage.png'})
    const content = await page.content();
    
    const $ = cheerio.load(content);
    const players = $('.widget-slide-list__item');

    players.each((i, element) => {
        const player = $(element);

        const playername = player.find('.widget-slide-list__content > h2').text();
        const stats = player.find('.widget-slide-list__content > div > p:nth-child(1)').text();
        const description = player.find('.widget-slide-list__content > div > p:nth-child(2)').text();

        db.collection("topfootballers").add({
            playername: {playername},
            stats: {stats},
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
