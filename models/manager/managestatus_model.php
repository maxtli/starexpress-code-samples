<?php

class ManageStatus_Model extends Model {

    function __construct() {
        parent::__construct();
    }
    
    function buildSearchColumnList($export = false) {
        return "SELECT PS.ID, P.ID AS PKID, P.TrackingNumber, PS.StatusTime, PS.Status, PS.Activity, PS.Location ";
    }

    function buildSearchSql($export = false) {
        return "FROM PackagesStatus AS PS INNER JOIN Packages AS P ON P.ID = PS.PackagesID ";
    }

    function buildSearchQuery($stinfo = []) {
        $whereString = [];
        $whereAdditions = array(
            'tracknum' => "P.TrackingNumber = :tracknum",
            'status' => "PS.Status = :status",
            'location' => "PS.Location = :location",
            'activity' => "PS.Activity = :activity",
            'pkid' => "P.ID = :pkid",
            'st' => "PS.StatusTime >= :st",
            'end' => "PS.StatusTime <= :end");   
        foreach ($stinfo as $key => $value) {
            if (empty($value) || empty($whereAdditions[$key])) {
                unset($stinfo[$key]);
            } else {
                $whereString[] = $whereAdditions[$key];
            }
        }
        return array('stinfo' => $stinfo, 'where' => ($whereString ? 'WHERE ' . implode(' AND ', $whereString) . ' ' : '') . 'ORDER BY PS.ID ');
    }

    function getSearchCount($query) {
        return $this->db->select('SELECT COUNT(*) ' . $this->buildSearchSql() . $query['where'], $query['stinfo'])[0]["COUNT(*)"];
    }
    
    function getSearchData($query, $export = false, $pageNo = 0, $perPage = 0) {
        return $this->db->select($this->buildSearchColumnList($export) . $this->buildSearchSql($export) . $query['where']
                        . ($pageNo ? 'LIMIT ' . ($pageNo - 1) * $perPage . ', ' . $perPage : ''), $query['stinfo']);
    }
    
    function findLine($stid) {
        $sql = "SELECT ID FROM PackagesStatus WHERE ID = :id";
        $raw = $this->db->select($sql, ["id" => $stid]);
        return $raw !== false && count($raw) === 1 ? $stid : false;
    }
    
    function deleteLine($stid) {
        return $this->db->iudProc("DELETE FROM PackagesStatus WHERE ID = :stid", ['stid' => $stid]) ? $stid : false ;
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

