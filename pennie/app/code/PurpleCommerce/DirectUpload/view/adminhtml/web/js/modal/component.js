define(['underscore', 'jquery', 'Magento_Ui/js/modal/modal-component', 'mage/url','Magento_Ui/js/modal/confirm'], function (_, $, Modal, url,confirmation) 
{
    'use strict';

    return Modal.extend(
    {
        saveData: function () 
        {
            this.applyData();

            var ajaxUrl = url.build('https://dev02.purplecommerce.live/mg235/admin_dev02/directupload/upload/index');

            var data = {
                'form_key': window.FORM_KEY,
                'data' : this.applied
            };
            
            var x=document.getElementsByName('link_name')[0].value;
            var y = $('.file-uploader-filename').html();
            var z = $(".folder_class input[type = 'radio']:checked");
            console.log("xxxxx",this.applied);
            $(document).on('click','.action-secondary',function(){
                $('.clean-on-clear').hide();
            });
            if(x===""){
                alert("please fill Name field");
            }else if(y==='' || y==undefined){
                alert("please select file");
            }else if(z.length===0){
                alert("please select folder");
            }else{
                $.ajax({
                    type: 'POST',
                    url: ajaxUrl,
                    data: data,
                    showLoader: true
                }).done(function (xhr) 
                {
                    console.log("xhr",JSON.parse(xhr));
                    var response = JSON.parse(xhr);
                    // var result = xhr.success;
                    if(response.result=='success'){
                        // alert(response.value);
                        // $('.clean-on-clear').hide();
                        
                        var txt = 'File Path: '+response.value+'';
                        txt += '<style>.extra-width .modal-inner-wrap {width: 50% !important;}</style>';
                        txt += '<br>Tag: &lt;a href="'+response.value+'">'+response.filename+'&lt;/a>';
                        txt += '<br>Please copy as this will not be available again.';
                        // $('.modal-component').append('&lt;a class="clean-on-clear" href="'+response.value+'">'+response.filename+'&lt;/a>');
                        confirmation({
                            title: $.mage.__('File uploaded!'),
                            content: $.mage.__(txt),
                            modalClass: 'extra-width',
                            actions: {
                                confirm: function(){}
                            }
                        });
                    }else{
                        alert("error");
                    }
                    if (xhr.error) 
                    {
                        self.onError(xhr);
                    }
                }).fail(this.onError);
    
               
                // this.closeModal();
            }
            
        },
    });
});