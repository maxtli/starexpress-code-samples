<?php

class ManageForecasts extends Controller {

    use SearchListController;

    function __construct() {
        parent::__construct();
        if ($this->uid['Access'] !== 'Supervisor')
            Utils::error();
        $this->SLC = 'fc';
    }

    function index() {
        $this->view->pageDetails = array(
            'title' => 'Manage Forecasts',
            'css' => ['innerstyles.css', 'manager/index.css'],
            'js' => ['table.js', 'manager/forecasts.js']);
        $this->view->render('manager/forecasts.php');
    }

    function a_search() {
        return $this->fn_search([
            'tracknum', 'service', 'warehouse', 'user', 'recipient', 'address', 'city', 'state',
            'country', 'zip', 'idready', 'status', 'pkid', 'signer', 'handler'], [
            'crst', 'crend', 'sgst', 'sgend', 'hnst', 'hnend'], ['declvol', 'vol', 'declwgt', 'wgt']);
    }
    
    function a_page($pageNo = 0) {
        return ['data' => $this->fn_getRows($pageNo)];
    }
    
    function a_perPage($perPage = 0) {
        return $this->fn_changeItemsPerPage($perPage);
    }
}
