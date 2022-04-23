<?php

class Session {

    public static function init() {
        if(session_status() == PHP_SESSION_NONE) {
            session_start(); 
            //$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?: $_SERVER['REMOTE_ADDR'];
            // if(Session::get('ID')[0] && time() - Session::get('timeout', true) > 1200) {
            //     Session::destroy();
            //     session_start();
            //     Session::setLang();
            //     return true;
            // }
            if(Session::get('lang', true) === false) Session::setLang();
        }
        Session::unsets('page', true);
    }
    
    public static function setLang() {
        $languages = explode(",", $_SERVER['HTTP_ACCEPT_LANGUAGE']);
        $lang = 'en';
        /*foreach($languages as $language) {
            $substr = substr($language, 0, 2);
            if($substr === 'zh'){
                $lang = 'cn';
                break;
            }
            if($susbstr === 'en'){
                $lang = 'en';
                break;
            }
        }*/
        Session::set('g_lang', $lang);
    }

    public static function set($name, $value = false, $global = false) {
        $_SESSION[($global ? 'g_' : ($_SESSION['g_page'] ?: '')) . $name] = $value;
    }

    public static function get($key, $global = false) {
        return $_SESSION[($global ? 'g_' : ($_SESSION['g_page'] ?: '')) . $key] ?: false;
    }
    
    public static function unsets($keys, $global = false) {
        if(is_array($keys)) foreach($keys as $key) {
            $key = ($global ? 'g_' : ($_SESSION['g_page'] ?: '')) . $key;
            if (isset($_SESSION[$key]))
                unset($_SESSION[$key]);       
        }
        else {
            $key = ($global ? 'g_' : ($_SESSION['g_page'] ?: '')) . $keys;
            if (isset($_SESSION[$key]))
                unset($_SESSION[$key]);
        }
    }

    public static function destroy() {
        $_SESSION = [];
        session_unset();
        session_destroy();
    }
    
    public static function getPost($key) {
        $item = $_POST[$key];
        if (is_array($item)){
            array_walk_recursive($item, "Session::filter");
            return $item;
        }
        else
            return htmlspecialchars($item, ENT_QUOTES, 'UTF-8');
    }
    
    public static function filter(&$value) {
        $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
}
