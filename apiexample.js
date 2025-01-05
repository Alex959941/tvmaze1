let apiURL = 'https://api.tvmaze.com/';
let episodeURL = 'https://api.tvmaze.com/episodes/'
let episodeData; 

// load the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }, function(error) {
      console.log('Service Worker registration failed:', error);
    });
  });
}      

// initialize page after HTML loads
window.onload = function() {
   closeLightBox();  // close the lightbox because it's initially open in the CSS
   document.getElementById("button").onclick = function () {
     searchTvShows();
   };
   document.getElementById("lightbox").onclick = function () {
     closeLightBox();
   };
} // window.onload


// get data from TV Maze
async function searchTvShows() {
  document.getElementById("main").innerHTML = "";
  
  let search = document.getElementById("search").value;  
   
  try {   
      const response = await fetch(apiURL + 'search/shows?q=' + search);
      const data = await response.json();
      console.log(data);
      showSearchResults(data);
  } catch(error) {
    console.error('Error fetching tv show:', error);
  } // catch
} // searchTvShows 
 

// change the activity displayed 
function showSearchResults(data) {
  
  // show each tv show from search results in webpage
  for (let tvshow in data) {
    createTVShow(data[tvshow]);
  } // for

} // showSearchResults

// in the json, genres is an array of genres associated with the tv show 
// this function returns a string of genres formatted as a bulleted list
function showGenres(genres) {
   let output = "<ul>";
   for (g in genres) {
      output += "<li>" + genres[g] + "</li>"; 
   } // for       
   output += "</ul>";
   return output; 
} // showGenres

// constructs one TV show entry on webpage
function createTVShow(tvshowJSON) {
  
    // get the main div tag
    var elemMain = document.getElementById("main");
    
    // create a number of new html elements to display tv show data
    var elemDiv = document.createElement("div");
    elemDiv.classList.add("shows");

    var elemImage = document.createElement("img");
    elemImage.classList.add("image");

    var elemShowTitle = document.createElement("h2");
    elemShowTitle.classList.add("showtitle"); // add a class to apply css
    
    var elemGenre = document.createElement("div");
    elemGenre.classList.add("genre");

    var elemRating = document.createElement("div");
    elemRating.classList.add("rating");

    var elemSummary = document.createElement("div");
    elemSummary.classList.add("summary");

    
    // add JSON data to elements
    elemImage.src = tvshowJSON.show.image.medium;
    elemShowTitle.innerHTML = tvshowJSON.show.name;

    if(tvshowJSON.show.genres.length === 0){
      elemGenre.innerHTML = "No genres available";
    }else {
      elemGenre.innerHTML = "Genres: " + showGenres(tvshowJSON.show.genres);
    }
    
    if (tvshowJSON.show.rating.average == null){
      elemRating.innerHTML = "No rating available<br>";
    } else{
      elemRating.innerHTML = "Rating: " + tvshowJSON.show.rating.average + "<br><br>";
    }
    
    elemSummary.innerHTML = tvshowJSON.show.summary;
    
       
    // add 5 elements to the div tag elemDiv
    elemDiv.appendChild(elemShowTitle);  
    elemDiv.appendChild(elemGenre);
    elemDiv.appendChild(elemRating);
    elemDiv.appendChild(elemImage);
    elemDiv.appendChild(elemSummary);
    
    // get id of show and add episode list
    let showId = tvshowJSON.show.id;
    fetchEpisodes(showId, elemDiv);
    
    // add this tv show to main
    elemMain.appendChild(elemDiv);
    
} // createTVShow

// fetch episodes for a given tv show id
async function fetchEpisodes(showId, elemDiv) {
     
  console.log("fetching episodes for showId: " + showId);
  
  try {
     const response = await fetch(apiURL + 'shows/' + showId + '/episodes');  
     const data = await response.json();
     console.log("episodes");
     console.log(data);
     showEpisodes(data, elemDiv);
  } catch(error) {
    console.error('Error fetching episodes:', error);
  } // catch
    
} // fetch episodes


// list all episodes for a given showId in an ordered list 
// as a link that will open a light box with more info about
// each episode
function showEpisodes (data, elemDiv) {
     
    let elemEpisodes = document.createElement("div");  // creates a new div tag

    let output = "<ol class='bigList'>";

    for (episode in data) {
        output += "<li class='list'><a class='link' href='javascript:showLightBox(" + data[episode].id + ")'>" + data[episode].name + "</a></li>";
    }
    output += "</ol>";
    elemEpisodes.innerHTML = output;
    elemDiv.appendChild(elemEpisodes);  // add div tag to page
        
} // showEpisodes

// open lightbox and display episode info
async function showLightBox(episodeId){
     try {

      document.getElementById("lightbox").style.display = "block";
      message = document.getElementById("message");

      const response = await fetch(episodeURL + episodeId);
      episodeData = await response.json();
      console.log(episodeData);

      // show episode info in lightbox
      message.innerHTML = "";
      message.innerHTML += "<h2 class='name'>" + episodeData.name + "</h2><h3>Episode #: " + episodeData.number + "<br>Season: " + episodeData.season + "</h3>";
      if (episodeData.image == null){
        message.innerHTML += "No image is available";
      } else {
        let img = document.createElement("img");
        img.classList.add("lightboxImage");
        img.src = episodeData.image.original;
        message.appendChild(img);
      }
      if (episodeData.summary == null){
        message.innerHTML += "<br>No summary is provided";
      } else {
        message.innerHTML += "<br>" + episodeData.summary;
      }
     } catch(error){
      console.error('Error fetching episodes:', error);
     }
     
     
} // showLightBox

 // close the lightbox
 function closeLightBox(){
     document.getElementById("lightbox").style.display = "none";
 } // closeLightBox 






