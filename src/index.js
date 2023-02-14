//       divError.textContent = "";
//       booksList.textContent = "";
//       if (!data.items.length) {
//         return (booksList.textContent = "Nothing found!");
//       }
//       const markup = data.items.map(
//         ({ title, author }) => `<li>${title}. Author: ${author}</li>`
//       );
//       booksList.insertAdjacentHTML("beforeend", markup.join(""));

// HTTP-запросы
// В качестве бэкенда используй публичный API сервиса Pixabay. Зарегистрируйся, получи свой уникальный ключ доступа и ознакомься с документацией.

// const { default: axios } = require('axios');

// Список параметров строки запроса которые тебе обязательно необходимо указать:

// =======Your API key: 33608636-10286b6eb715989d3ae9c7763=======

// key - твой уникальный ключ доступа к API.
// q - термин для поиска. То, что будет вводить пользователь.
// image_type - тип изображения. Мы хотим только фотографии, поэтому задай значение photo.
// orientation - ориентация фотографии. Задай значение horizontal.
// safesearch - фильтр по возрасту. Задай значение true.
// В ответе будет массив изображений удовлетворивших критериям параметров запроса. Каждое изображение описывается объектом, из которого тебе интересны только следующие свойства:

// webformatURL - ссылка на маленькое изображение для списка карточек.
// largeImageURL - ссылка на большое изображение.
// tags - строка с описанием изображения. Подойдет для атрибута alt.
// likes - количество лайков.
// views - количество просмотров.
// comments - количество комментариев.
// downloads - количество загрузок.
// Если бэкенд возвращает пустой массив, значит ничего подходящего найдено небыло. В таком случае показывай уведомление с текстом "Sorry, there are no images matching your search query. Please try again.". Для уведомлений используй библиотеку notiflix.

// Галерея и карточка изображения
// Элемент div.gallery изначально есть в HTML документе, и в него необходимо рендерить разметку карточек изображений. При поиске по новому ключевому слову необходимо полностью очищать содержимое галереи, чтобы не смешивать результаты.

// Шаблон разметки карточки одного изображения для галереи.

// {/* <div class="photo-card">
//   <img src="" alt="" loading="lazy" />
//   <div class="info">
//     <p class="info-item">
//       <b>Likes</b>
//     </p>
//     <p class="info-item">
//       <b>Views</b>
//     </p>
//     <p class="info-item">
//       <b>Comments</b>
//     </p>
//     <p class="info-item">
//       <b>Downloads</b>
//     </p>
//   </div>
// </div> */}

// Пагинация
// Pixabay API поддерживает пагинацию и предоставляет параметры page и per_page. Сделай так, чтобы в каждом ответе приходило 40 объектов (по умолчанию 20).

// Изначально значение параметра page должно быть 1.
// При каждом последующем запросе, его необходимо увеличить на 1.
// При поиске по новому ключевому слову значение page надо вернуть в исходное, так как будет пагинация по новой коллекции изображений.
// В HTML документе уже есть разметка кнопки при клике по которой необходимо выполнять запрос за следующей группой изображений и добавлять разметку к уже существующим элементам галереи.

// <button type="button" class="load-more">Load more</button>

// Изначально кнопка должна быть скрыта.
// После первого запроса кнопка появляется в интерфейсе под галереей.
// При повторном сабмите формы кнопка сначала прячется, а после запроса опять отображается.
// В ответе бэкенд возвращает свойство totalHits - общее количество изображений которые подошли под критерий поиска (для бесплатного аккаунта). Если пользователь дошел до конца коллекции, пряч кнопку и выводи уведомление с текстом "We're sorry, but you've reached the end of search results.".

// ======================================

// const booksErrorContainer = document.getElementById("books-error");

// key - твой уникальный ключ доступа к API.
// q - термин для поиска. То, что будет вводить пользователь.
// image_type - тип изображения. Мы хотим только фотографии, поэтому задай значение photo.
// orientation - ориентация фотографии. Задай значение horizontal.
// safesearch - фильтр по возрасту. Задай значение true.
// =======Your API key: 33608636-10286b6eb715989d3ae9c7763=======

// =====================form======================

import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

import axios from 'axios';

const form = document.getElementById('search-form');
const list = document.querySelector('.gallery');
const guard = document.querySelector('.guard');

const BASE_URL = 'https://pixabay.com/api/';

let pageToFetch = 1;
let queryToFetch = '';

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
  const imgArr = imgObj.hits;
  console.log(imgArr);
  if (imgArr.length === 0) {
    return alert(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  renderCard(imgArr);
  pageToFetch += 1;
  console.log(pageToFetch);
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
        return `<a class="gallery__item" href ="${largeImageURL}">
    <div class="photo-card">
        <img  class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" />
        
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
        </div>
        </a>`;
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
new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});
