// AJAX //
(function ($) {

  function submitReviewForm(event) {
    // var reviewForm = $('#review-form');
    var review = $('#review');
    var reviewRating = $('#reviewRating');

    event.preventDefault();
    // console.log("Form submitted.");
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
        // console.log("Added Review");
      });
    }
  }

  function submitBuyForm(event) {
    // var buyForm = $('#buy-form');
    var buyFormat = $('#buyFormat');

    event.preventDefault();
    // console.log("Form submitted.");
    var buyFormatVal = buyFormat.val();
    // alert("BuyFormat: "+buyFormatVal);

    if (!buyFormatVal){
      alert("No format selected.");
    }
    else{
      var currentId = $(this).data('id');

      var requestConfig = {
        method: 'POST',
        url: '/shoppingCart/',
        data: JSON.stringify({
          artId: currentId,
          format: buyFormatVal
        })
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        // console.log("Added Review");
      });
    }
  }

  var reviewButton = $('#reviewButton')
  reviewButton.on('click', submitReviewForm);

  var buyButton = $('#buyButton')
  buyButton.on('click', submitBuyForm);


})(window.jQuery);