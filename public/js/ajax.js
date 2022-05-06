// // AJAX //
// (function ($) {
//     var accept = $('#accept'),
//       reject = $('#reject'),
//       myForm = $('#myForm');
  
//     let requestConfig = {
//       method: 'GET',
//       url:'http://localhost:3000/requests'
//     }
    
//     $.ajax(requestConfig).then(function (responseMessage) {
//       // SEARCH FORM SUBMISSION
//       myForm.accept(function (event) {
//         event.preventDefault();
//         showList.empty();
//         show.empty();
  
//         const x = search_term.val();
//         //console.log(x)
  
//         requestConfig = {
//           method: 'GET',
//           url:'http://api.tvmaze.com/search/shows?q=' + x
//         }
  
//         $.ajax(requestConfig).then(function (responseMessage) {
  
//           errorDiv.hide();
  
//           if ($.trim(x) == '') {
            
//             showList.hide();
//             errorDiv.show();
//             errorDiv.html('Please enter a valid search term.');
//             //frmLabel.className = 'error';
//           }
          
//           for (s of responseMessage) {
//             showList.append(`<li><a class="showLink" href='${s.show._links.self.href}' data-id='${s.show.id}'>${s.show.name}</li>`);
//           }
  
//           // $.each(responseMessage, function (index, value) {
//           //   showList.append(`<li><a class="showLink" href='${value._links.self.href}' data-id='${value.id}'>${value.name}</li>`);
//           // })
//         });
//         showList.show();
//       });
//     });
//   })(window.jQuery);