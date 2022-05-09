// AJAX //
(function ($) {
    var reviewForm = $('#review-form');
    var review = $('#review');
  
    reviewForm.submit(function (event) {
      event.preventDefault();
  
      var reviewText = review.val();
  
      if (!reviewText || reviewText.trim().length==0) {
        alert("Review is empty or all spaces.");
      }
      else{
        var currentId = $(this).data('id');

        var requestConfig = {
          method: 'PUT',
          url: '/artworks/' + currentId,
          data: JSON.stringify({
            review: reviewText
          })
        };
  
        $.ajax(requestConfig).then(function (responseMessage) {
          console.log("Added Review");
        });
      }
    });
  })(window.jQuery);