<?php

class OrderTicket extends Controller{

    function __construct() {
        parent::__construct();
        $this->fn_checkCustomerCredentials('orderTicket');
        $this->view->pageDetails = array(
            "title" => "Create Order Ticket", 
            "css" => ["innerstyles.css", "customer/orderticket.css"],
            "js" => ['findproduct.js', "customer/orders/ticket.js"]);
    }
    
    function index() {
        $this->view->render('customer/order/ticket.php', true, false);    
    }
    
    function a_submit() {
        $ticket = [];
        foreach(['Brand', 'Name', 'UPC', 'Size', 'Color', 'StyleNo', 'Specification', 'Materials', 'Description'] as $item)
            if($_POST[$item]) $ticket[$item] = $_POST[$item];
        if($_POST['selSubCat']) $ticket['HomeCategoriesID'] = $this->model->getIdByName('HomeCategories', $_POST['selSubCat'], 'RootCategories', $_POST['selRootCat'] ?: Utils::error());
        $i = 0;
        $accepted = ['.bmp', '.jpg', '.jpeg', '.png'];
        $pics = [];
        while ($i < 10 && $_FILES['pic' . $i] && $_FILES['pic' . $i]['name']) {
            $pic = $_FILES['pic' . $i];
            $ext = substr($pic['name'], strrpos($pic['name'], "."));
            if (!in_array($ext, $accepted) || $pic['size'] > 5000000 || $pic['error']) Utils::error();
            $pics[] = ['src' => $pic['tmp_name'], 'ext' => $ext];
            $i++;
        }
        if(empty($ticket) && empty($pics)) Utils::error('Empty');
        $otid = $this->model->submitTicket($this->uid[0], $ticket, count($pics));
        foreach($pics as $i => $pic)
            if(!move_uploaded_file($pic['src'], URL . TICKETUPLOADS . $otid . '-' . $i . $pic['ext'])) Utils::error('Some pictures failed to upload.');
    }
} 