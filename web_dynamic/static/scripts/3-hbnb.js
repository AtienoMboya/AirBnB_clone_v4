$('document').ready(function () {
  const host = '0.0.0.0:5001';
  const amenityChecked = {};
  const amenityCheckboxArray = Array.from($('div.amenities input:checkbox'));
  for (let i = 0; i < amenityCheckboxArray.length; i++) {
    amenityCheckboxArray[i].addEventListener('change', () => {
      if ($(amenityCheckboxArray[i]).is(':checked')) {
        amenityChecked[$(amenityCheckboxArray[i]).attr('data-id')] = $(amenityCheckboxArray[i]).attr('data-name');
      } else {
        delete amenityChecked[$(amenityCheckboxArray[i]).attr('data-id')];
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

  $.getJSON(`http://${host}/api/v1/status/`, (r) => {
    if (r?.status === 'OK') {
      $('DIV#api_status').addClass('available');
    } else {
      $('DIV#api_status').removeClass('available');
    }
  });

  $.ajax({
    method: 'POST',
    url: `http://${host}/api/v1/places_search/`,
    data: JSON.stringify({}),
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
      titleBox.append($('<h2></h2>').text(`${datum.name}`));
      titleBox.append($('<div></div>').text(`${datum.price_by_night}`).addClass('price_by_night'));
      article.append(titleBox);
      info.append($('<div></div>').text(`${datum.max_guest} Guest${datum.max_guest > 1 ? 's' : ''}`).addClass('max_guest'));
      info.append($('<div></div>').text(`${datum.number_rooms} Bedroom${datum.number_rooms > 1 ? 's' : ''}`).addClass('number_rooms'));
      info.append($('<div></div>').text(`${datum.number_bathrooms} Bathroom${datum.number_bathrooms > 1 ? 's' : ''}`).addClass('number_bathrooms'));
      article.append(info);
      desc.append($('<div></div>').text(`${datum.description || 'None'}`));
      article.append(desc);
      $('SECTION.places').append(article);
    }
  });
});
