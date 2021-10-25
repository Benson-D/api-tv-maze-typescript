import axios from "axios";
import * as $ from "jquery";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

const BASE_URL = "https://api.tvmaze.com/";
const DEFAULT_IMAGE = "https://tinyurl.com/tv-missing";

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface EpisodeInterface {
  id: number; 
  name: string; 
  season: number; 
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios({
    url: `${BASE_URL}/search/shows`,
    params: { q: term },
    method: "GET",
  });

  return response.data.map((resultShow) => {
    const show = resultShow.show;
    const { id, name, summary, image } = show;
    return { 
      id, 
      name, 
      summary, 
      image : image ? image.medium : DEFAULT_IMAGE
    };
  });

  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary: `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
  //          normal lives, modestly setting aside the part they played in
  //          producing crucial intelligence, which helped the Allies to victory
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //       "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg",
  //   },
  // ];
}

/** Given list of shows, create markup for each and to DOM 
 * 
 *  returns: 
 *  [{id: 1234, name: "Pilot", season: "1", number: "1"}, ...]
*/

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="${show.image} photo"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await axios({
    url: `${BASE_URL}shows/${id}/episodes`,
    method: "GET",
  });
  console.log("response.data", response.data);

  return response.data.map((resultEpisode) => {
    console.log({resultEpisode});
    const { id, name, season, number } = resultEpisode;
    return { 
      id, 
      name, 
      season,
      number,
    };
  });
}

/** Function is provided an array of episodes info, 
 *  and populates that into the #episodesList part 
 *  of the DOM */

function populateEpisodes(episodes) {
  $episodesList.empty();
  for (let episode of episodes) {
    const $listItem = $(`<li>${episode.name} (Season: ${episode.season}, Number: ${episode.number})</li>`);
    $episodesList.append($listItem);
  }

  $episodesArea.show();
 }

$showsList.on("click", ".Show-getEpisodes", async function (evt) {
  const $showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow($showId);
  populateEpisodes(episodes);
})