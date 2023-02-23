import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

import axios from 'axios';

import Notiflix from 'notiflix';

const form = document.getElementById('search-form');
const list = document.querySelector('.gallery');
const guard = document.querySelector('.guard');

const BASE_URL = 'https://pixabay.com/api/';

let pageToFetch = 1;
let queryToFetch = '';
let totalPages = 1;

form.addEventListener('submit', onSubmit);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        getImgArr(queryToFetch, pageToFetch);
      }
    });
  },
  { rootMargin: '200px' }
);

async function fetchImgRequest(request, page) {
  try {
    const params = new URLSearchParams({
      key: '33608636-10286b6eb715989d3ae9c7763',
      q: `${request}`,
      page: `${page}`,
      per_page: '40',
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    });
    const imgRequest = await axios.get(`${BASE_URL}?${params}`);
    return imgRequest.data;
  } catch (error) {
    console.log(error);
  }
}

async function getImgArr(query, page) {
  const imgObj = await fetchImgRequest(query, page);
  const imgArr = await imgObj.hits;
  totalPages = Math.ceil(imgObj.totalHits / 40);

  if (imgArr.length === 0) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  renderCard(imgArr);

  const lightbox = new SimpleLightbox('.gallery a');

  lightbox.refresh();

  if (page >= totalPages) {
    observer.unobserve(guard);

    return Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }

  pageToFetch += 1;

  observer.observe(guard);
}

function renderCard(imgArr) {
  const markup = imgArr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card"><a class="gallery__link"  href="${largeImageURL}" >
        <img  class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
        
            <div class="info">
            <p class="info-item">
                <b>Likes</b>
                    ${likes}
            </p>
            <p class="info-item">
                <b>Views</b>
                    ${views}
            </p>
            <p class="info-item">
                <b>Comments</b>
                    ${comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>
                    ${downloads}
                    </p>
            </div>
        </div>`;
      }
    )
    .join('');

  list.insertAdjacentHTML('beforeend', markup);
}

function onSubmit(e) {
  e.preventDefault();
  const request = e.target.elements.searchQuery.value.toLowerCase().trim();
  if (!request || queryToFetch === request) {
    return;
  }
  queryToFetch = request;
  pageToFetch = 1;
  list.innerHTML = '';
  getImgArr(queryToFetch, pageToFetch);
  form.reset();
}
