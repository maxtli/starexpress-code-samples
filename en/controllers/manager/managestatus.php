<?php

class ManageStatus extends Controller {
    use SearchListController;
    
    function __construct() {
        parent::__construct();
        if ($this->uid['Access'] !== 'Supervisor')
            Utils::error();
        $this->SLC = 'st';
    }

    function index() {
        $this->view->pageDetails = array(
            'title' => 'Manage Shipment Status',
            'css' => ['innerstyles.css', 'manager/index.css'],
            'js' => ['table.js', 'manager/status.js']);
        $this->view->render('manager/status.php');
    }
    
    function find($num = '') {
        if(empty($num))
            exit(header('location: '.WEBURL.'managestatus'));
        $this->view->num = $num;
        $this->index();
    }
    
    function a_search() {
        return $this->fn_search(['tracknum', 'status', 'location', 'activity', 'pkid'], array(
            'st', 'end'));
    }
    
    function a_page($pageNo = 0) {
        return ['data' => $this->fn_getRows($pageNo)];
    }
    
    function a_perPage($perPage = 0) {
        return $this->fn_changeItemsPerPage($perPage);
    }
    
    function a_delete() {
        $info = $this->fn_validateOperation('delete', [0], [0]);
        foreach ($info as $line) {
            if ($this->model->deleteLine($line) === false)
                Utils::error('Some statuses deleted');
        }
        return ['count' => count($info)];
    }

    function fn_validateDelete($row) {
        return $this->model->findLine($row[0]) ?: Utils::error();
    }
}