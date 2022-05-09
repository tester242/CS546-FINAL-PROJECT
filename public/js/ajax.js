// AJAX //
(function ($) {
  var reviewForm = $('#review-form');
  var review = $('#review');
  var reviewRating = $('#reviewRating');

  reviewForm.submit(function (event) {
    event.preventDefault();
    console.log("Form submitted.");
    var reviewText = review.val();
    var reviewRatingVal = reviewRating.val();

    if (!reviewText || reviewText.trim().length==0) {
      alert("Review is empty or all spaces.");
    }
    if (!reviewRatingVal){
      alert("No review rating.");
    }
    else{
      var currentId = $(this).data('id');

      var requestConfig = {
        method: 'POST',
        url: '/artworks/' + currentId,
        data: JSON.stringify({
          rating: reviewRatingVal,
          review: reviewText
        })
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        console.log("Added Review");
      });
    }
  });
})(window.jQuery);