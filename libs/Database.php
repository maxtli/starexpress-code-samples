<?php

//TODO: structure the 'where' part of the query

class Database extends PDO{

    function __construct($DBTYPE, $DBHOST, $DBNAME, $DBUSER, $DBPASS) {
        parent::__construct($DBTYPE.':host='.$DBHOST.';dbname='.$DBNAME, $DBUSER, $DBPASS, 
                array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
    }
    
    /**
     * select
     * @param string $table A name of table to select from
     * @param array $columns Data columns to select
     * @param string $where The WHERE query part
     * @param array $params An associative array of params to bind
     * @param PDO $fetchMode PDO Fetch Mode
     * @return mixed Fetch All Rows
     */

    function recall($sth, $cond = false) {
        if($sth->errorInfo()[0] !== '00000' || $cond) {
            if($this->inTransaction())
                $this->rollBack();
            Utils::error($sth->errorInfo());
        }
    }

    public function select($sql, $params = array(), $strict = false) {
        $sth = $this->prepare($sql);
        //echo "<div style = 'padding:10px 0'>".$params["pkid"]."</div>";
        foreach ($params as $key => $value) {
            $sth->bindValue(":$key", $value);
        }
        $sth->execute();
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        $this->recall($sth, $strict && !($result && $result[0]));
        return $result;
    }

    //STRICT MODE FOR OUTPARAMPROC, RESULTSETPROC
    
    // insert, update, delete operation.
    //Calling stored procedures WITHOUT RESULT SET and OUT parameter.
    public function iudProc($sql, $data = [], $strict = true) {
        $sth = $this->prepare($sql);
        foreach ($data as $key => $value) {
            $sth->bindValue(":$key", $value);
        }
        /*echo $sql . '</br>';
        print_r($data);  // for test */
        $sth->execute();
      //  return $sth->fetchAll();
      $this->recall($sth, $strict && !$sth->rowCount());
      return $sth->rowCount();
    }
        
    //Calling stored procedures that return a result set
    public function resultSetProc($sql, $params = array(), $fetchMode = PDO::FETCH_ASSOC) {
        $sth = $this->prepare($sql);
        foreach ($params as $key => $value) {
            $sth->bindValue(":$key", $value);
        }
        $sth->execute();  
        $this->recall($sth);
        return $sth->fetchAll($fetchMode);
    }

    //Calling stored procedures that return a result set
    public function resultSetProcMultiple($sql, $params = array(), $collapseSingle = true, $fetchMode = PDO::FETCH_ASSOC) {
        $sth = $this->prepare($sql);
        foreach ($params as $key => $value) {
            $sth->bindValue(":$key", $value);
        }
        $sth->execute();
        $this->recall($sth);
        $set = $sth->fetchAll($fetchMode);
        if(count($set) === 1 && $collapseSingle)
            $set = $set[0];
        $sets[] = $set;
        while($sth->nextRowset()) {
            $set = $sth->fetchAll($fetchMode);
            if(count($set) === 1 && $collapseSingle)
                $set = $set[0];
            $sets[] = $set;
        }
        return $sets;
    }

    //OUT PARAM PROC ALWAYS STRICT
    //Calling stored procedures with an OUT parameter
    public function outParamProc($sql, $params = [], $outCount = 1) {
        //$sql = 'CALL GetCustomerLevel(:id,@level)';
        $sth = $this->prepare($sql);
        foreach ($params as $key => $value) {
            //$sth->bindParam(':id', $customerNumber, PDO::PARAM_INT);
            $sth->bindValue(":$key", $value);
        }
        $sth->execute();  
        $query = 'SELECT @out';
        for ($i = 2; $i <= $outCount; $i++) {
            $query .= ', @out' . $i;
        }
        $out = $this->query($query)->fetch();
        $this->recall($sth, empty($out));
        return $outCount === 1 ? $out['@out'] : $out;
    }
}
