<?php
namespace PurpleCommerce\DirectUpload\Model\Config\Source;

use Magento\Framework\Option\ArrayInterface;

class Folder implements ArrayInterface
{
    /**
     * @return array
     */
    public function toOptionArray()
    {
        $options = [
            0 => [
                'label' => 'Upload',
                'value' => 'uploads'
            ],
            1 => [
                'label' => 'Assets',
                'value' => 'assets'
            ],
        ];

        return $options;
    }
}