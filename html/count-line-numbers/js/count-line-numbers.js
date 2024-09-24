$( document ).ready(function() {

  showLoad();

  $.ajax({
    url: "/scripts/countLineNumbers"
  }).done(function(data){
    showMain();
    $('#data').text(data);
  }).fail(function(error){
    showMain();
    showError(error);
  });

});
