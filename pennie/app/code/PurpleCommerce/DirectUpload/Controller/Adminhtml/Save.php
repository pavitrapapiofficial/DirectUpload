<?php

namespace PurpleCommerce\DirectUpload\Controller\Adminhtml;

use Magento\Framework\Exception\LocalizedException;

class Save extends \Magento\Backend\App\Action
{
    protected $dataPersistor;

    public function __construct(
        \Magento\Backend\App\Action\Context $context,
        \Magento\Framework\App\Request\DataPersistorInterface $dataPersistor
    ) {
        $this->dataPersistor = $dataPersistor;
        parent::__construct($context);
    }

    public function execute()
    {
        $data = $this->_filterFoodData($data);
        $model->setData($data);
        $model->save();
    }

    public function _filterFoodData(array $rawData)
    {
        //Replace files with fileuploader field name
        $data = $rawData;
        if (isset($data['files'][0]['name'])) {
            $data['files'] = $data['files'][0]['name'];
        } else {
            $data['files'] = null;
        }
        return $data;
    }
}