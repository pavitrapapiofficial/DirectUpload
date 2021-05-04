<?php
namespace PurpleCommerce\DirectUpload\Controller\Adminhtml\Upload;

use Magento\Framework\App\Action\HttpPostActionInterface as HttpPostActionInterface;
use Magento\Backend\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;
use Magento\Backend\App\Action;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem;
use Magento\Framework\App\Request\DataPersistorInterface;

class Index extends Action implements HttpPostActionInterface
{
    /**
     * @var PageFactory
     */
    protected $resultPageFactory;
    
    private $dataPersistor;
    /**
     * @return \Magento\Framework\Controller\Result\Redirect|\Magento\Framework\View\Result\Page
     */
    private $fileUploaderFactory;
    private $fileSystem;
    /**
     * @var \Magento\Framework\Mail\Template\TransportBuilder
     */
    protected $_transportBuilder;
    /**
     * @var \Magento\Framework\Filesystem\Io\File
     */
    protected $fileIo;

    /**
     * @var \Magento\Framework\Translate\Inline\StateInterface
     */
    protected $inlineTranslation;
    /**
     * Image uploader
     * @var \Magento\Catalog\Model\ImageUploader
     */
    protected $imageUploader;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var \Magento\Store\Model\StoreManagerInterface
     */
    protected $_storeManager;

    /**
     * @param \Magento\Framework\App\Action\Context $context
     * @param \Magento\Framework\Mail\Template\TransportBuilder $transportBuilder
     * @param \Magento\Framework\Translate\Inline\StateInterface $inlineTranslation
     * @param \Magento\Catalog\Model\ImageUploader       $imageUploader
     * @param \Magento\Framework\Filesystem\Io\File      $fileIo
     * @param \Magento\Framework\Filesystem              $filesystem
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
     * @param PageFactory $resultPageFactory
     */
    
    public function __construct(
        Context $context,
        PageFactory $resultPageFactory,
        Filesystem $fileSystem,
        \Magento\MediaStorage\Model\File\UploaderFactory $fileUploaderFactory,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Catalog\Model\ImageUploader $imageUploader,
        \Magento\Framework\Filesystem\Io\File $fileIo,
        \Magento\Framework\Mail\Template\TransportBuilder $transportBuilder,
        \Magento\Framework\Translate\Inline\StateInterface $inlineTranslation,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
    ) {
        parent::__construct($context);
        $this->resultPageFactory = $resultPageFactory;
        $this->fileUploaderFactory = $fileUploaderFactory;
        $this->fileSystem          = $fileSystem;
        $this->imageUploader = $imageUploader;
        $this->fileIo = $fileIo;
        $this->_transportBuilder = $transportBuilder;
        $this->inlineTranslation = $inlineTranslation;
        $this->_storeManager = $storeManager;
        $this->scopeConfig = $scopeConfig;
    }

    /**
     * Index action
     *
     * @return \Magento\Backend\Model\View\Result\Page
     */
    public function execute()
    {
        $post = $this->getRequest()->getPostValue();
        $folder = $post['data']['product_form.product_form.test_model.general.folder'];
        $linkName=$post['data']['product_form.product_form.test_model.general.link_name'];
        $override = $post['data']['product_form.product_form.test_model.general.override'];
        $fileurl = $this->normalizePath($post['data']['product_form.product_form.test_model.general.files'][0]['url']);
        $docName = $post['data']['product_form.product_form.test_model.general.files'][0]['name'];
        

        // $docName = $imageResult['name'];
        $firstName = substr($docName, 0, 1);
        $secondName = substr($docName, 1, 1);

        $mediaRootDir = $this->fileSystem->getDirectoryRead(DirectoryList::MEDIA)->getAbsolutePath() . 'test/' . $firstName . '/' . $secondName . '/';
        $movetodir = $this->fileSystem->getDirectoryRead(DirectoryList::ROOT)->getAbsolutePath().'/'.$folder.'/';
        if (!is_dir($movetodir)) {
            $this->fileIo->mkdir($movetodir, 0775);
        }
        // Set image name with new name, If image already exist
        $newdocName = $this->updatedocName($movetodir, $docName);
        if(file_exists($movetodir.$newdocName) && $override){
            unlink($movetodir.$newdocName);
        }
        $docpath = $this->_storeManager->getStore()->getBaseUrl().'/'.$folder.'/'.$newdocName;
        if($this->fileIo->mv($mediaRootDir . $docName, $movetodir.$newdocName)){
            $result = ["result"=>"success","value"=>$docpath,"filename"=>$linkName];
        }else{
            $result = ["result"=>"error","value"=>"<a href='".$docpath."'>".$linkName."</a>"];
        }

        echo json_encode($result);
    }

    public function updatedocName($path, $file_name)
    {
        if ($position = strrpos($file_name, '.')) {
            $name = substr($file_name, 0, $position);
            $extension = substr($file_name, $position);
        } else {
            $name = $file_name;
        }
        $new_file_path = $path . '/' . $file_name;
        $new_file_name = $file_name;
        $count = 0;
        while (file_exists($new_file_path)) {
            $new_file_name = $name . '_' . $count . $extension;
            $new_file_path = $path . '/' . $new_file_name;
            $count++;
        }
        return $new_file_name;
    }
    private function normalizePath($path)
    {
        return str_replace('\\', '/', $path);
    }
}