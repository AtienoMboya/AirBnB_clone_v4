$('document').ready(function () {
  const placesData = {
    amenities: [],
    states: [],
    cities: []
  };
  const host = '0.0.0.0:5001';
  const amenityChecked = {};
  const amenityCheckboxArray = Array.from($('div.amenities input:checkbox'));
  for (let i = 0; i < amenityCheckboxArray.length; i++) {
    amenityCheckboxArray[i].addEventListener('change', () => {
      if ($(amenityCheckboxArray[i]).is(':checked')) {
        amenityChecked[$(amenityCheckboxArray[i]).attr('data-id')] = $(amenityCheckboxArray[i]).attr('data-name');
        placesData.amenities.push($(amenityCheckboxArray[i]).attr('data-id'));
      } else {
        delete amenityChecked[$(amenityCheckboxArray[i]).attr('data-id')];
        const index = placesData.amenities.indexOf($(amenityCheckboxArray[i]).attr('data-id'));
        if (index > -1) { // only splice placesData.amenities when item is found
          placesData.amenities.splice(index, 1); // 2nd parameter means remove one item only
        }
      }
      const list = [];
      for (const id in amenityChecked) {
        list.push(amenityChecked[id]);
      }
      list.sort();
      if (list.length !== 0) {
        $('div.amenities h4').html(list.join(', '));
      } else {
        $('div.amenities h4').html('&nbsp;');
      }
    });
  }

  function handlePlacesData (currInput, prop) {
    // console.log("currIn", $(currInput))
    if ($(currInput).is(':checked')) {
      placesData[prop].push($(currInput).attr('data-id'));
    } else {
      const id = placesData[prop].indexOf($(currInput).attr('data-id'));
      if (id > -1) {
        placesData[prop].splice(id, 1);
      }
    }
  }

  const states = $('DIV.popover ul:first li div input:checkbox');
  const cities = $('DIV.popover ul li ul li input:checkbox');

  for (let i = 0; i < states.length; i++) {
    $(states[i]).change(function () {
      handlePlacesData($(this), 'states');
    });
  }

  for (let i = 0; i < cities.length; i++) {
    $(cities[i]).change(function () {
      handlePlacesData($(this), 'cities');
    });
  }

  $.getJSON(`http://${host}/api/v1/status/`, (r) => {
    if (r?.status === 'OK') {
      $('DIV#api_status').addClass('available');
    } else {
      $('DIV#api_status').removeClass('available');
    }
  });
  function getPlaces (obj) {
    $.ajax({
      method: 'POST',
      url: `http://${host}/api/v1/places_search/`,
      data: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    }).done((data) => {
      for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        const article = $('<article></article>');
        const titleBox = $('<div></div>').addClass('title_box');
        const info = $('<div></div>').addClass('information');
        const desc = $('<div></div>').addClass('description');
        const review = $('<div></div>').addClass('reviews');
        titleBox.append($('<h2></h2>').text(`${datum.name}`));
        titleBox.append($('<div></div>').text(`${datum.price_by_night}`).addClass('price_by_night'));
        article.append(titleBox);
        info.append($('<div></div>').text(`${datum.max_guest} Guest${datum.max_guest > 1 ? 's' : ''}`).addClass('max_guest'));
        info.append($('<div></div>').text(`${datum.number_rooms} Bedroom${datum.number_rooms > 1 ? 's' : ''}`).addClass('number_rooms'));
        info.append($('<div></div>').text(`${datum.number_bathrooms} Bathroom${datum.number_bathrooms > 1 ? 's' : ''}`).addClass('number_bathrooms'));
        article.append(info);
        desc.append($('<div></div>').text(`${datum.description || 'None'}`));
        article.append(desc);
        $.ajax({
          method: 'GET',
          url: `http://${host}/api/v1/places/${datum.id}/reviews`,
          headers: {
            'Content-Type': 'application/json'
          }
        }).done((reviews) => {
          review.append($('<h2></h2>').text(`${reviews.length} Review${reviews.length > 1 ? 's' : ''}`));
          const reviewList = $('<ul></ul>').addClass('hide_reviews');
          const mySpan = $('<span></span>');
          mySpan.text('show');
          mySpan.click(function () {
            if ($(this).text() === 'show') {
              reviewList.removeClass('hide_reviews');
              $(this).text('hide');
            } else {
              reviewList.addClass('hide_reviews');
              $(this).text('show');
            }
          });
          console.log(mySpan);
          review.append(mySpan);
          for (let j = 0; j < reviews.length; j++) {
            const reviewItem = $('<li></li>');
            $.ajax({
              method: 'GET',
              url: `http://${host}/api/v1/users/${reviews[j].user_id}`,
              headers: {
                'Content-Type': 'application/json'
              }
            }).done((user) => {
              reviewItem.prepend($('<h3></h3>').text(`From ${user.first_name} ${user.last_name} the ${formatDate(reviews[j].created_at)}`));
            });
            reviewItem.append($('<p></p>').text(`${reviews[j].text}`));
            reviewList.append(reviewItem);
          }
          review.append(reviewList);
        });
        article.append(review);
        $('SECTION.places').append(article);
      }
    });
  }

  function formatDate (date) {
    const revDate = new Date(date);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = revDate.getDate().toString();
    const year = revDate.getFullYear();
    const month = revDate.getMonth();
    const newString = `${day}${day[day.length - 1] === '1' ? 'st' : day[day.length - 1] === '2' ? 'nd' : day[day.length - 1] === '3' ? 'rd' : 'th'} ${monthNames[month]} ${year}`;
    return newString;
  }
  getPlaces({});

  $('BUTTON').click(() => {
    $('SECTION.places').empty();
    getPlaces(placesData);
  });
});
