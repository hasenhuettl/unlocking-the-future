$( document ).ready(function() {

  $.ajax({
    url: "/scripts/countLineNumbers"
  }).done(function(data){
    $('#data').text(data);
  }).fail(function(error){
    showError(error);
  });

});
