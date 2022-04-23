<?php

class Utils {
    static function error($msg = '') {
        if(Session::get('ajax', true))
            echo json_encode(['success' => false, 'msg' => json_encode($msg)]);
        else {
            $v = new View();
            $v->pageDetails = [
                "title" => "Page Not Found", 
                "css" => "cover/error.css"];
            $v->render('cover/error.php');
        }
        exit;
    }

    static function timeout($page, $ajax = false) {
        if ($ajax)
            Utils::error('You have been inactive for over 15 minutes. Please log in again.');
        header('location: '.WEBURL.'login?redir=' . $page . '&msg=timeout');
        exit;
    }

    static function validate($field, $mode, $soft = false) {
        $result = (function($field, $mode) {
            switch($mode) {
                case 'qty': return filter_var($field, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
                case 'index': return filter_var($field, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
                case 'float': return filter_var($field, FILTER_VALIDATE_FLOAT, ['options' => ['min_range' => 0.01, 'max_range' => 10000]]);
                case 'tn': return preg_match("/^[A-Za-z]{2}[0-9]{6,}$/", $field) ? $field : false;
                case 'date':
                    $properDate = DateTime::createFromFormat($field[1], $field[0]);
                    return $properDate && date_format($properDate, $field[1]) === $field[0] ? $field[0] : false;
                case 'dt': return Utils::validate([$field[0], 'Y-m-d'], 'date') && preg_match("/^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/", $field[1]) ? $field[0] . ' ' . $field[1] : false;
            }
        })($field, $mode);
        return $result === false ? ($soft ? false : Utils::error()) : $result;
    }

    static function sanitize($input, $filtCase = '') {
        switch ($filtCase) {
            case 'lower':
                if(empty($input) || !is_string($input))
                    Utils::error();
                return strtolower(preg_replace("/[^a-zA-Z0-9]/", "", $input)) ?: Utils::error();
            case 'idopt':
            case 'idlist':
                if (empty($input) || !is_array($input))
                    Utils::error('Empty');
                $str = preg_replace(['idopt' => "/[^0-9',]/", 'idlist' => "/[^0-9'(),]/i"][$input], '', implode(['idopt' => "','", 'idlist' => "'),('"][$input], $input));
                if(count($str) > 65535)
                    Utils::error();
                return ['str' => $str, 'count' => count($input)];
            case 'tnlist':
                return ;
        }
    }
}
