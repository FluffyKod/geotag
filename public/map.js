///////////////////////////
// CONSTANTS
///////////////////////////
const token =
    'pk.eyJ1IjoiZmx1ZmZ5cG90YXRvIiwiYSI6ImNqc2xqMzZhcjFwcWI0YWw1aXBvbXoxdHcifQ.PIQyxuIcKF4OlWUfmCfhkQ';

// ICONS
const blueIcon = new L.Icon({
    iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const grayIcon = new L.Icon({
    iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const redIcon = new L.Icon({
    iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

///////////////////////////
// SELECTORS
///////////////////////////
const sweatpointsLabel = document.querySelector('#sweatpoints');

///////////////////////////
// SETUP
///////////////////////////
const proximity = 2;
let sweatpoints = 0;
let initQuestions = false;

// Create new map
var map = L.map('map', {
    enableHighAccuracy: true,
}).fitWorld();

// Get graphics for map
L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
        attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 30,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: token,
    }
).addTo(map);

///////////////////////////
// QUESTION
///////////////////////////
class Question {
    constructor(question, answers, correct, latlng) {
        this.question = question;
        this.answers = answers;
        this.correct = correct;
        this.latlng = latlng;
        this.active = true;
        this.completed = false;
        this.marker = L.marker(latlng, { icon: grayIcon, opacity: 0.5 });
        this.added = false;
    }
    addToMap() {
        if (this.added == false) {
            this.marker.addTo(map);
            this.added = true;
        }
    }
    activate() {
        this.marker.setIcon(blueIcon);
        this.marker.setOpacity(1);
    }
    deactivate() {
        this.marker.setIcon(grayIcon);
        this.marker.setOpacity(0.5);
    }
}

// All questions
// new Question(
//     '',
//     ['', '', ''],
//     2,
//     [, ]
// ),

// let questions = [
//     new Question(
//         'Hur många sekunder tar det för solens ljus att nå jorden?',
//         ['125s', '499s', '834.57s'],
//         1,
//         [59.306222, 18.102063]
//     ),
//     new Question(
//         'Vem anses vara den första programmeraren?',
//         ['Alan Turing', 'Bill Gates', 'Ada Lovelace'],
//         2,
//         [59.304843, 18.102574]
//     ),
//     new Question(
//         'När skapades det första datorviruset?',
//         ['1983', '2001', '1965'],
//         0,
//         [59.306877, 18.106906]
//     ),
//     new Question(
//         'Vad hette det första programmeringsspråket?',
//         ['Java', 'Fortran', 'Python'],
//         1,
//         [59.305608, 18.099358]
//     ),
//     new Question(
//         'Vilken planet skulle flyta om man la den i vatten?',
//         ['Merkurius', 'Neptunus', 'Saturnus'],
//         2,
//         [59.304148, 18.095912]
//     ),
//     new Question(
//         'Hur snabbt kan neutronstjärnor rotera per sekund?',
//         ['500', '0.5', '200'],
//         0,
//         [59.304259, 18.110573]
//     ),
// ];

let coordinates = [
    [59.306222, 18.102063],
    [59.304843, 18.102574],
    [59.306877, 18.106906],
    [59.305608, 18.099358],
    [59.304148, 18.095912],
    [59.304259, 18.110573],
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function giveSweatpoints(amount) {
    sweatpoints += amount;
    sweatpointsLabel.innerText = sweatpoints;
}

function addQuestionsToMap() {
    for (let question of questions) {
        question.addToMap();
    }
}

function allQUestionsCompleted() {
    for (let question of questions) {
        if (question.completed == false) {
            return false;
        }
    }
    return true;
}

// Get random question
function getRandomQuestion() {
    if (allQUestionsCompleted()) {
        let maxSweatpoints = 20 * questions.length;
        Swal.fire(
            'Alla avklarade!',
            `Snyggt jobbat! Du samlade ${sweatpoints}/${maxSweatpoints} sweatpoints!!`,
            'success'
        );
        map.stopLocate();
    } else {
        let question = questions[Math.floor(Math.random() * questions.length)];
        if (question.completed) {
            getRandomQuestion();
        } else {
            activeQuestion = question;
            activeQuestion.activate();
        }
    }
}

function showQuestion(question) {
    if (!swal.isVisible() && !question.completed) {
        Swal.fire({
            title: question.question,
            input: 'radio',
            inputOptions: question.answers,
            inputValidator: (value) => {
                if (!value) {
                    return 'Du behöver välja ett alternativ!';
                }
            },
        }).then((result) => {
            question.completed = true;

            // remove marker
            map.removeLayer(question.marker);
            playerCircle.setStyle({ fillColor: 'blue' });
            let playerChoice = question.answers[result.value];

            if (playerChoice == question.correct) {
                // Correct
                giveSweatpoints(20);

                Swal.fire('Rätt!', 'Du fick 20 sweatpoints!', 'success').then(
                    () => {
                        // get a new question
                        getRandomQuestion();
                    }
                );
            } else {
                // incorrect
                giveSweatpoints(10);

                Swal.fire(
                    'Tyvärr var det fel!',
                    `Rätt svar var "${question.correct}". Du fick ändå 10 sweatpoints för att du tog dig hit! Ta nästa fråga istället!`,
                    'error'
                ).then(() => {
                    // get a new question
                    getRandomQuestion();
                });
            }
        });
    }
}

// Get random question and activate
let questions = [];
let activeQuestion = null;

fetch('https://opentdb.com/api.php?amount=6&type=multiple')
    .then((res) => res.json())
    .then((data) => {
        for (let [i, q] of data.results.entries()) {
            let answers = q.incorrect_answers;
            answers.push(q.correct_answer);
            shuffleArray(answers);

            let question = new Question(
                q.question,
                answers,
                q.correct_answer,
                coordinates[i]
            );
            questions.push(question);
        }

        getRandomQuestion();

        addQuestionsToMap();

        // showQuestion(activeQuestion);
    });

function onLocationFound(e) {
    let radius = e.accuracy / proximity;

    player.setLatLng(e.latlng);
    playerCircle.setRadius(radius);
    playerCircle.setLatLng(e.latlng);

    if (activeQuestion) {
        // Check if player is on question1
        let distance = map.distance(
            player.getLatLng(),
            activeQuestion.marker.getLatLng()
        );

        if (distance < radius) {
            playerCircle.setStyle({ fillColor: 'green' });
            showQuestion(activeQuestion);
        }
    }
}

function onLocationError(e) {
    alert(e.message);
}

function changeLocateMaxZoom(e) {
    if (map._locateOptions) {
        map._locateOptions.maxZoom = map.getZoom();
    }
}

// Player marker
let player = L.marker(map.getCenter(), { icon: redIcon }).addTo(map);
let playerCircle = L.circle(map.getCenter(), 0).addTo(map);

map.locate({
    setView: true,
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
});

///////////////////////////
// EVENT LISTENERS
///////////////////////////
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.on('zoomend', changeLocateMaxZoom);
