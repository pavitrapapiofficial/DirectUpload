require(
    [
        'Magento_Ui/js/lib/validation/validator',
        'jquery',
        'mage/translate'
], function(validator, $){

        validator.addRule(
            'custom-validation',
            function (value) {
                console.log("custom vlidation",value);
                if(value==null){
                    return false;
                }
                //return true or false based on your logic

            }
            ,$.mage.__('This is require field.')
        );
});