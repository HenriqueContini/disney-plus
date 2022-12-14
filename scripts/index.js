const API_KEY = '58a978411da62e93d626c9b0ded64650';
const API_LANGUAGE = 'pt-br';
const BASE_URL_IMAGE = {
    original: 'https://image.tmdb.org/t/p/original',
    small: 'https://image.tmdb.org/t/p/w500'
};

const movies = [];
const moviesElement = document.getElementById('movies');

let movieActive = '';

function getUrlMovie(movieId) {
    return `https://api.themoviedb.org/3/movie/${movieId}?language=${API_LANGUAGE}&api_key=${API_KEY}`;
}

function changeButtonMenu() {
    const button = document.querySelector('.button__menu');
    button.classList.toggle('active');

    const navigation = document.querySelector('.navigation');
    navigation.classList.toggle('active');
}

function setMainMovie(movie) {
    const appImage = document.querySelector('.app__image img');
    const title = document.querySelector('.feature__movie h1');
    const description = document.querySelector('.feature__movie p');
    const info = document.querySelector('.feature__movie span');
    const rating = document.querySelector('.rating strong');
    const buttonWatch = document.querySelector('.link__movie');

    title.innerHTML = movie.title;
    description.innerHTML = movie.overview;
    rating.innerHTML = movie.vote_average;
    info.innerHTML = `${movie.release} - ${movie.genre} - Movie`;
    buttonWatch.href = `https://www.imdb.com/title/${movie.id}`;

    appImage.setAttribute('src', movie.image.original);
}

function changeMovieActiveInList(newMovieActive) {
    const movieActiveCurrent = document.getElementById(movieActive);
    movieActiveCurrent.classList.remove('active-movie');

    const movieActiveNew = document.getElementById(newMovieActive);
    movieActiveNew.classList.add('active-movie');

    movieActive = newMovieActive;
}

function changeMainMovie(movieId) {
    changeMovieActiveInList(movieId);

    const movie = movies.find(movie => movie.id === movieId);

    if(movie?.id) {
        setMainMovie(movie);
        changeButtonMenu();
    } else {
        console.log('Não foi possível achar o filme com o id', movieId)
    }
}

function createButtonMovie(movieId) {
    const button = document.createElement('button');
    button.setAttribute('onclick', `changeMainMovie('${movieId}')`);
    button.innerHTML = '<img src="./assets/icon-play-button.png" alt="Ver filme" />';
    return button;
}

function createImageMovie(movieImage, movieTitle) {
    const divImageMovie = document.createElement('div');
    divImageMovie.classList.add('movie__image');

    const image = document.createElement('img');
    image.setAttribute('src', movieImage);
    image.setAttribute('alt', `Imagem do filme ${movieTitle}`);
    image.setAttribute('loading', 'lazy');

    divImageMovie.appendChild(image);

    return divImageMovie;
}

function addMovieInList(movie) {
    const movieElement = document.createElement('li');
    movieElement.classList.add('movie');

    movieElement.setAttribute('id', movie.id);

    const genre = `<span>${movie.genre}</span>`;
    const title = `<strong>${movie.title}</strong>`;

    movieElement.innerHTML = genre + title;
    movieElement.appendChild(createButtonMovie(movie.id));
    movieElement.appendChild(createImageMovie(movie.image.small, movie.title));

    moviesElement.appendChild(movieElement);
}

async function getMovieData(movieId) {
    const isMovieInList = movies.findIndex(movie => movie.id === movieId);

    if(isMovieInList === -1) {
        try {
            let data = await fetch(getUrlMovie(movieId));
            data = await data.json();
        
            const movieData = {
                id: movieId,
                title: data.title,
                overview: data.overview,
                vote_average: data.vote_average,
                genre: data.genres[0].name,
                release: data.release_date.split('-')[0],
                image: {
                    original: BASE_URL_IMAGE.original.concat(data.backdrop_path),
                    small: BASE_URL_IMAGE.small.concat(data.backdrop_path)
                }
            }
    
            movies.push(movieData);
        
            return movieData;
        } catch(error) {
            console.log('Mensagem de erro: ' + error.message);
        }
    }

    return null;

}

function loadMovies() {
    const LIST_MOVIES = ['tt12801262', 'tt4823776', 'tt5113044', 'tt2948372','tt5109280', 'tt0266543'];

    LIST_MOVIES.map(async (movie, index) => {
        const movieData = await getMovieData(movie);

        addMovieInList(movieData);

        if(index === 0) {
            setMainMovie(movieData);

            movieActive = movieData.id;

            const movieActiveNew = document.getElementById(movieActive);
            movieActiveNew.classList.add('active-movie');
        }
    })
}

function formattedMovieId(movieId) {
    if(movieId.includes('https://www.imdb.com/title/')) {
        const id = movieId.split('/')[4];        
        return id;
    }

    return movieId;
}

const buttonAddMovie = document.getElementById('add__movie');

buttonAddMovie.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newMovieId = formattedMovieId(event.target['movie'].value);
    const newMovie = await getMovieData(newMovieId);

    if(newMovie?.id) {
        addMovieInList(newMovie);
    }

    event.target['movie'].value = '';
})

loadMovies();