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
// GAME CONTROLLER
///////////////////////////
class GameController {
  constructor() {
    this.sweatpoints = 0;
    this.questions = []
    this.activeQuestion = null;
    this.coordinates = getSavedCoordinates();
    this.radius = null;

    fetch(`https://opentdb.com/api.php?amount=${this.coordinates.length}&type=multiple`)
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
                    this.coordinates[i]
                );
                this.questions.push(question);
            }

            this.getRandomQuestion();

            // this.addQuestionsToMap();
        });

    // THIS reference to game not to event
    this.onLocationFound = (e) => {
        this.radius = showPlayer(e)
        this.playerAtQuestion()
    }
  }

  onLocationError(e) {
      alert(e.message);
  }
  playerAtQuestion() {
    if (this.activeQuestion && this.radius) {

        // Check if player is on question1
        let distance = map.distance(
            player.getLatLng(),
            this.activeQuestion.marker.getLatLng()
        );

        if (distance < this.radius) {
            playerCircle.setStyle({ fillColor: 'green' });
            this.showQuestion(this.activeQuestion);
        }
    }
  }
  addQuestionsToMap() {
      for (let question of this.questions) {
          question.addToMap();
      }
  }
  giveSweatpoints(amount) {
      this.sweatpoints += amount;
      sweatpointsLabel.innerText = this.sweatpoints;
  }
  allQUestionsCompleted() {
      for (let question of this.questions) {
          if (question.completed == false) {
              return false;
          }
      }
      return true;
  }
  getRandomQuestion() {
      if (this.allQUestionsCompleted()) {
          let maxSweatpoints = 20 * this.questions.length;
          Swal.fire(
              'Alla avklarade!',
              `Snyggt jobbat! Du samlade ${this.sweatpoints}/${maxSweatpoints} sweatpoints!!`,
              'success'
          );
          map.stopLocate();
      } else {
          let question = this.questions[Math.floor(Math.random() * this.questions.length)];
          if (question.completed) {
              this.getRandomQuestion();
          } else {
              this.activeQuestion = question;
              this.activeQuestion.activate();
          }
      }
  }
  showQuestion(question) {
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
                  this.giveSweatpoints(20);

                  Swal.fire('Rätt!', 'Du fick 20 sweatpoints!', 'success').then(
                      () => {
                          // get a new question
                          this.getRandomQuestion();
                      }
                  );
              } else {
                  // incorrect
                  this.giveSweatpoints(10);

                  Swal.fire(
                      'Tyvärr var det fel!',
                      `Rätt svar var "${question.correct}". Du fick ändå 10 sweatpoints för att du tog dig hit! Ta nästa fråga istället!`,
                      'error'
                  ).then(() => {
                      // get a new question
                      this.getRandomQuestion();
                  });
              }
          });
      }
  }
}

function getSavedCoordinates() {
  let savedCoordinates;

  if (localStorage.getItem('coordinates') === null) {
    savedCoordinates = [];
  } else {
    savedCoordinates = JSON.parse(localStorage.getItem('coordinates'))
  }

  return savedCoordinates;
}

///////////////////////////
// MARKER CONTROLLER
///////////////////////////
class MarkerController {
  constructor() {
    this.markers = []
    this.coordinates = []
    this.savedCoordinates = getSavedCoordinates()
    this.addSavedCoordinates();

    // Update label with instructions
    sweatpointsP.innerHTML = 'Klicka på kartan för att lägga till en koordinat.';

    // this refers to controller, not object
    this.onMapClick = (e) => {
      this.addCoordinate(e.latlng)

      // Make savebutton appear
      if (!saveBtn.classList.contains('active')) {
        saveBtn.classList.add('active')
      }
    }

  }
  onLocationFound(e) {
      showPlayer(e)
  }
  onLocationError(e) {
      alert(e.message);
  }
  addCoordinate(latlng) {
    // Add clicked coordinate to array
    this.coordinates.push(latlng)

    // Create a marker and add it to the map
    let newMarker = L.marker(latlng).addTo(map)

    // newMarker.on('click', this.onMarkerClick)
    let popupButton = document.createElement('button');
    popupButton.innerText = 'Remove Marker';
    popupButton.classList.add('remove-btn');
    popupButton.addEventListener('click', () => {
      this.removeMarker(newMarker._leaflet_id);
    })

    newMarker.bindPopup(popupButton);

    this.markers.push(newMarker);
  }
  addSavedCoordinates() {
    for (let coord of this.savedCoordinates) {
      this.addCoordinate(coord)
    }
  }
  saveCoordinates(popup = true) {
    // Save coordinates to local storage
    localStorage.setItem('coordinates', JSON.stringify(this.coordinates))

    if (popup) {
      Swal.fire(
        'Markers Saved!',
        'Dina markers har blivit sparade. Ladda om sidan och klicka på PLAY för att spela!',
        'success'
      )
    }
  }
  removeMarker(markerId) {

    let clickedMarker = this.markers.find(marker => {
      return marker._leaflet_id == markerId
    });

    let markerIndex = this.markers.indexOf(clickedMarker)

    // Remove marker from map
    map.removeLayer(clickedMarker);

    // Remove marker and coordinates
    this.markers.splice(markerIndex, 1);
    this.coordinates.splice(markerIndex, 1);
    this.saveCoordinates(false)
  }

}

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

function initController(controller) {
  map.on('locationfound', controller.onLocationFound);
  map.on('locationerror', controller.onLocationError);

  introScreen.style.display = 'none';

  map.locate({
      setView: true,
      maxZoom: 18,
      watch: 'true',
      enableHighAccuracy: true,
  });
}

function showPlayer(e) {
  let radius = e.accuracy / proximity;

  player.setLatLng(e.latlng);
  playerCircle.setRadius(radius);
  playerCircle.setLatLng(e.latlng);

  return radius
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function changeLocateMaxZoom(e) {
    if (map._locateOptions) {
        map._locateOptions.maxZoom = map.getZoom();
    }
}

function fade(callback) {
  $(overlay).animate({
    opacity: 1
  }, 2000, function() {
    callback()

    $(overlay).animate({
      opacity: 0
    }, 2000)
  })
}

///////////////////////////
// SELECTORS
///////////////////////////
const sweatpointsLabel = document.querySelector('#sweatpoints');
const sweatpointsP = document.querySelector('.sweatpoints-container p');
const playBtn = document.querySelector('#play-btn');
const markerBtn = document.querySelector('#marker-btn');
const overlay = document.querySelector('#overlay');
const introScreen = document.querySelector('#intro-screen');
const center = document.querySelector('#center');
const saveBtn = document.querySelector('#save-btn');

///////////////////////////
// SETUP
///////////////////////////
const proximity = 0.2;

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

// Player marker
let player = L.marker(map.getCenter(), { icon: redIcon }).addTo(map);
let playerCircle = L.circle(map.getCenter(), 0).addTo(map);

///////////////////////////
// EVENT LISTENERS
///////////////////////////
map.on('zoomend', changeLocateMaxZoom);
// map.on('moveend', function() {
//   map._locateOptions.setView = false;
// })

playBtn.addEventListener('click', function() {
  game = new GameController();

  fade(function() {
    initController(game)
    game.addQuestionsToMap()
    game.playerAtQuestion()
  });
})

markerBtn.addEventListener('click', function() {
  fade(function() {
    markerController = new MarkerController()
    initController(markerController)

    map.on('click', markerController.onMapClick)

    // Do not center map on player if user moves around
    map.on('moveend', function() {
      map._locateOptions.setView = false;
    })
  })
})

saveBtn.addEventListener('click', function() {
  markerController.saveCoordinates()
})

// center.addEventListener('click', function() {
//   map._locateOptions.setView = true;
//   map.setView(player.getLatLng())
// })
