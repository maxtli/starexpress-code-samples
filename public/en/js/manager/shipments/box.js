$(function() {
   load('manageshipments/box', false);
   $('.scanfgidbutton').click(function(e) {
       e.preventDefault();
       var itemarea = $(this).parents('.c_box-bl');
       itemarea.find('.fgiderrorlabel').prop('hidden', true);
       if(checkEmptyFields(itemarea.find('.fgidinput'))) {
           if(itemarea.find('.fgidinput').val() === itemarea.find('.fgidindic').html()) {
           itemarea.prop('class', 'c_box-bl c_t_green');
           $(this).parent().css('visibility', 'hidden');
           }
           else itemarea.find('.fgiderrorlabel').prop('hidden', false);
    }
   });
   $('#finalizeBoxbutton').click(function() {
       if(checkEmptyFields($('.fgidinput:visible'))) {
           $('.j_load').prop('hidden', false);
           ajaxSubmit('manageshipments/a_box', ($('.continueBox').prop('checked') ? 'manageshipments/box?success=' + $('#tracknumindic').html() : 'manageshipments/viewBox'), {'tracknum' : $('#tracknumindic').html(), 'date' : $('#seldate').val(), 'time' : $('#seltime').val()}, '', 'GET');
       }
   });
});