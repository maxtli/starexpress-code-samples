<?php

class Bootstrap {

    function __construct() {
        error_reporting(E_ERROR);
        ini_set('display_errors', 'On');
        $url = isset($_GET['url']) ? $_GET['url'] : null;
        $url = explode('/', rtrim($url, '/'), 3);
        if (empty($url[0])) {
            $url[0] = 'home';
        }
        $ajax = (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest');
        if (Session::init())
            Utils::timeout($url[0], $ajax);
        Session::set('timeout', time(), true); 
        Session::set('ajax', $ajax, true);
        $folder = URL . Session::get('lang', true) . '/controllers/';
        $file = $folder . (PAGES[$url[0]] ?: '') . $url[0] . '.php';
        if (file_exists($file)) {
            require $file;
        } else 
            Utils::error();
        Session::set('page', $url[0], true);
        $controller = new $url[0];
        $controller->fn_loadModel($url[0]);
        if($ajax !== ($url[0] === 'api' || ($url[1] && strpos($url[1], 'a_') === 0)))
            Utils::error();
        $result = $url[1] ? 
            (method_exists($controller, $url[1]) ? 
                ($url[2] ? $controller->{$url[1]}($url[2]) : $controller->{$url[1]}()) 
                : Utils::error()) 
            : $controller->index();
        if($ajax) {           
            if($url[0] === 'api') {
                echo json_encode($result);
                exit;
            }
            if(is_array($result))
                $result['success'] = true;
            else
                $result = ['success' => true, 'data' => $result];
            echo json_encode($result);
        }
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

