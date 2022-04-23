<?php

class ManageShipments_Model extends Model {

    function __construct() {
        parent::__construct();
    }

    function buildSearchColumnList($export = false) {
        return "SELECT P.TrackingNumber, P.ID, P.CreateTime, "
                . ($export ? "O.BuyerID, D.TrackingNumber AS DeliveryTrackingNumber, " : "")
                . "IFNULL(I.IDStatus, 'Unsubmitted') AS IDStatus, "
                . ($export ? "O.SKU AS OrderSKU, PD.DeclaredQuantity, PD.ActualQuantity, O.OrderRemarks, "
                . "O.ProductDetail, O.Price AS OrderPrice, O.Remarks, O.BuyerMessage, "
                . "Ph.Number AS Phone, I.UploadTime AS IDUploadTime, I.Number AS IDNumber, " : "")
                . "CONCAT_WS('', Pl.LastName, Pl.FirstName) AS Recipient, A.Address, "
                . "A.PostalCode AS Zip, C.Name AS City, St.Name AS State, Cy.Name AS Country, "
                . ($export ? "O.Platform, O.OrderID, O.Title, O.OrderStatus, O.OrderTime, "
                . "O.PayTime, O.PaymentType, O.PaymentAccount, O.PaymentID, O.StoreName, "
                . "HCO.Name AS OrderItemCategory, G.UPC, G.SKU AS GoodSKU, "
                . "G.Name AS GoodName, ID.Brand, ID.StyleNo, "
                . "ID.Color, ID.Size, ID.Specification, ID.Materials, "
                . "G.UnitPrice AS GoodUnitPrice, HCG.Name AS GoodCategory, " : "")
                . "P.ActualWeight, P.ActualVolume, "
                . "P.DeclaredWeight, P.DeclaredVolume, "
                . "P.Status, S.Name AS Service, "
                . "AU.UserName, W.Name AS Warehouse, "
                . "P.SignTime, E1.UserName AS Signer, "
                . "P.HandlingTime, E2.UserName AS Handler "
                . ($export ? ", T.Name AS Transporter, S1.Name AS TransporterService, "
                . "D.OutboundTime, TT.Name AS TransferTransporter, D.TransferTrackingNumber " : "");
    }

    function buildSearchSql($export = false) {
        return "FROM Packages AS P "
                . "INNER JOIN Services AS S ON P.ServicesID = S.ID "
                . "INNER JOIN Recipients AS R ON P.RecipientsID = R.ID "
                . "INNER JOIN AddressPeople AS AP ON R.AddressPeopleID = AP.ID "
                . "LEFT JOIN Identification AS I ON AP.RecentIdentificationID = I.ID "
                . "INNER JOIN People AS Pl ON AP.PeopleID = Pl.ID "
                . "INNER JOIN Address AS A ON AP.AddressID = A.ID "
                . "INNER JOIN Cities AS C ON A.CitiesID = C.ID "
                . "INNER JOIN States AS St ON C.StatesID = St.ID "
                . "INNER JOIN Countries AS Cy ON St.CountriesID = Cy.ID "
                . "INNER JOIN AccountsUsers AS AU ON P.AccountsUsersID = AU.ID "
                . "INNER JOIN Warehouses AS W ON P.WarehousesID = W.ID "
                . "LEFT JOIN Employees AS E1 ON P.Signer = E1.ID "
                . "LEFT JOIN Employees AS E2 ON P.Handler = E2.ID "
                . ($export ? "INNER JOIN Phones AS Ph ON R.PhonesID = Ph.ID "
                . "INNER JOIN PackagesDeclaration AS PD ON P.ID = PD.PackagesID "
                . "LEFT JOIN Goods AS G ON PD.GoodsID = G.ID LEFT JOIN ItemDetails AS ID ON G.ItemDetailsID = ID.ID "
                . "LEFT JOIN HomeCategories AS HCG ON G.HomeCategoriesID = HCG.ID "
                . "LEFT JOIN OrdersInfo AS O ON PD.OrdersInfoID = O.ID "
                . "LEFT JOIN HomeCategories AS HCO ON O.HomeCategoriesID = HCO.ID "
                . "LEFT JOIN Deliveries AS D ON P.ID = D.PackagesID "
                . "LEFT JOIN TransportersServices AS TS ON D.TransportersServicesID = TS.ID "
                . "LEFT JOIN Transporters AS T ON TS.TransportersID = T.ID "
                . "LEFT JOIN Services AS S1 ON TS.ServicesID = S1.ID "
                . "LEFT JOIN Transporters AS TT ON D.TransferTransportersID = TT.ID " : "");
    }

    function buildSearchQuery($pkinfo = []) {
        $whereString = [];
        if (empty($pkinfo['Status'])) {
            $whereString[] = "P.Status != 'Delivered'";
        } else if ($pkinfo['Status'] === "All") {
            unset($pkinfo['Status']);
        }
        if (count($pkinfo)) {
            if ($pkinfo['IdStatus'] === 'Unsubmitted') {
                $whereString[] = 'I.IDStatus IS NULL';
                unset($pkinfo['IdStatus']);
            }
            $whereAdditions = array(
                'PackageID' => "P.ID =",
                'CreateTimeSt' => "P.CreateTime >=",
                'CreateTimeEnd' => "P.CreateTime <=",
                'TrackingNumber' => "P.TrackingNumber =",
                'Service' => "S.Name =",
                'RecipientName' => "CONCAT_WS('', P1.LastName, P1.FirstName) =",
                'Address' => "A.Address =",
                'Zip' => "A.PostalCode =",
                'City' => "C.Name =",
                'State' => "St.Name =",
                'Country' => "Cy.Name =",
                'ActualWeightMin' => "P.ActualWeight >=",
                'ActualWeightMax' => "P.ActualWeight <=",
                'ActualVolumeMin' => "P.ActualVolume >=",
                'ActualVolumeMax' => "P.ActualVolume <=",
                'DeclaredWeightMin' => "P.DeclaredWeight >=",
                'DeclaredWeightMax' => "P.DeclaredWeight <=",
                'DeclaredVolumeMin' => "P.DeclaredVolume >=",
                'DeclaredVolumeMax' => "P.DeclaredVolume <=",
                'Username' => "AU.UserName =",
                'Status' => "P.Status =",
                'Warehouse' => "W.Name =",
                'Signer' => "E1.UserName =",
                'Handler' => "E2.UserName =",
                'SignTimeSt' => "P.SignTime >=",
                'SignTimeEnd' => "P.SignTime <=",
                'HandleTimeSt' => "P.HandlingTime >=",
                'HandleTimeEnd' => "P.HandlingTime <=",
                'IdStatus' => "I.IDStatus ="
            );
            foreach ($pkinfo as $key => $value) {
                if (empty($value) || empty($whereAdditions[$key])) {
                    unset($pkinfo[$key]);
                } else {
                    $whereString[] = $whereAdditions[$key] . ' :' . $key;
                }
            }
        }
        return array('pkinfo' => $pkinfo, 'where' => ($whereString ? 'WHERE ' . implode(' AND ', $whereString) . ' ' : '') . 'ORDER BY P.ID ');
    }

    function getSearchCount($query) {
        return $this->db->select('SELECT COUNT(*) ' . $this->buildSearchSql() . $query['where'], $query['pkinfo'])[0]["COUNT(*)"];
    }
    
    function getSearchData($query, $export = false, $pageNo = 0, $perPage = 0) {
        return $this->db->select($this->buildSearchColumnList($export) . $this->buildSearchSql($export) . $query['where']
                        . ($pageNo ? 'LIMIT ' . ($pageNo - 1) * $perPage . ', ' . $perPage : ''), $query['pkinfo']);
    }

    function getSearchDataList($numlist, $export = false) {
        return $this->db->select($this->buildSearchColumnList($export) . $this->buildSearchSql($export) . "WHERE P.TrackingNumber IN (" . $numlist . ") ORDER BY P.ID");
    }

    function searchList($numlist) {
        return $this->db->resultSetProcMultiple('CALL check_track_num_list ("' . $numlist . '", NULL)');
    }
    
    function getFirstBox() {
        $raw = $this->db->select("SELECT CreateTime, TrackingNumber, ID FROM Packages WHERE Status = 'Picking' ORDER BY CreateTime ASC LIMIT 1");
        return $raw ? $raw[0]: false;
    }

    function getPackageContents($tracknum) {
        $raw = $this->db->select("SELECT I.Amount AS Qty, I.ForecastsGoodsID, RC.Name AS RootCategory, HC.Name AS SubCategory, Pr.UPC, Pr.SKU, Pr.Name AS ItemName, Pr.UnitPrice, ID.Brand, ID.StyleNo, ID.Color, ID.Size, ID.Specification, ID.Materials "
        . 'FROM Packages AS P INNER JOIN PackagesDeclaration AS PD ON P.ID = PD.PackagesID INNER JOIN Inventory AS I ON I.PackagesDeclarationID = PD.ID INNER JOIN Products AS Pr ON I.ProductsID = Pr.ID '
        . 'INNER JOIN HomeCategories AS HC ON Pr.HomeCategoriesID = HC.ID INNER JOIN RootCategories AS RC ON HC.RootCategoriesID = RC.ID INNER JOIN ItemDetails AS ID ON Pr.ItemDetailsID = ID.ID WHERE P.TrackingNumber = :tracknum', ['tracknum' => $tracknum]);
        return $raw ?: false;
    }
    
    function boxPackage($tracknum, $pkid) {
        return $this->db->iudProc("UPDATE Packages SET Status = 'Boxed' WHERE TrackingNumber = :tracknum AND ID = :id", ['tracknum' => $tracknum, 'id' => $pkid]) 
        && $this->db->iudProc("INSERT INTO PackagesStatus (StatusTime, Status, Activity, Location, PackagesID) VALUES (NOW(), 'Ground US', 'Package boxed', 'New York', :id", ['id' => $pkid]) ? true : false;
    }
    
    function getPkid($tracknum) {
        $sql = "SELECT ID FROM Packages WHERE TrackingNumber = :trackingNumber";
        $raw = $this->db->select($sql, ["trackingNumber" => $tracknum]);
        return $raw !== false && count($raw) === 1 ? $raw[0]['ID'] : false;
    }

    public function findPackage($tracknum, $pkid) {
        $sql = "SELECT CreateTime, DeclaredWeight, Status FROM Packages WHERE ID = :id AND TrackingNumber = :trackingNumber";
        $raw = $this->db->select($sql, ["id" => $pkid, "trackingNumber" => $tracknum]);
        return $raw !== false && count($raw) === 1 ? $raw[0] : false;
    }

    public function findTransporterService($carrier, $service) {
        $sql = "SELECT TS.ID FROM TransportersServices AS TS "
                . "INNER JOIN Services AS S ON TS.ServicesID = S.ID "
                . "INNER JOIN Transporters AS T ON TS.TransportersID = T.ID "
                . "WHERE S.Name = :serviceName AND T.Name = :transporterName";
        $raw = $this->db->select($sql, ["serviceName" => $service, "transporterName" => $carrier]);
        return $raw === false || count($raw) === 0 ? false : $raw[0]['ID'];
    }

    public function signPackage($package, $user, $warehouse, $statustime = false) {
        $params = array(
            'weight' => $package['ActualWeight'],
            'signer' => $user,
            'warehouse' => $warehouse,
            'id' => $package[1],
        );
        if($statustime)
            $params['statustime'] = $statustime;
        $sql = "UPDATE Packages SET ActualWeight = :weight, WarehousesID = :warehouse, Signer = :signer, SignTime = " . ($statustime ? ':statustime' : 'NOW()');
        if (!empty($package['ActualVolume'])) {
            $sql .= ", ActualVolume = :volume";
            $params['volume'] = $package['ActualVolume'];
        }
        $sql .= $package['OverWeight'] ? ", Status = 'ExtraWeight'" : ", Status = 'Signed'";
        $sql .= "WHERE ID = :id";
        if ($this->db->iudProc($sql, $params) === false)
            return false;
        if ($package['OverWeight'])
            return 'OverWeight';
        $params = ['statustime' => $statustime, 'id' => $package[1]];
        $statusSql = "INSERT INTO PackagesStatus(StatusTime, Status, Activity, Location, PackagesID) "
                . "VALUES (:statustime, 'Ground US', '包裹在威彻斯特已揽收。', 'Westchester', :id)";
        return $this->db->iudProc($statusSql, $params) === false ? false : 'Success';
    }
    
    public function updatePackage($package) {
        if ($package['RecipientName']) {
            $namelen = strlen($package['RecipientName']) < 10 ? 3 : 6;
            $package['LastName'] = substr($package['RecipientName'], 0, $namelen);
            $package['FirstName'] = substr($package['RecipientName'], $namelen);
        }
        $editParams = ['pkid' => $package[1], 'tracknum' => $package[0]];
        $keyString = ':pkid, :tracknum, ';
        foreach (['FirstName', 'LastName', 'Address', 'Zip', 'City', 'State', 'Phone'] as $key) {
            if($package[$key]) {
                $keyString .= ':' . $key . ', ';
                $editParams[$key] = $package[$key];
            } else
                $keyString .= 'NULL, ';
        }
        $sql = 'CALL update_recipient (' . $keyString . '@out)';
        return $this->db->outParamProc($sql, $editParams);
    }

    function sendPackage($package, $user, $warehouse, $statustime) {
        $packageSql = "UPDATE Packages SET Status = 'Delivery' WHERE ID = :id";
        $params = ['id' => $package[1]];
        if ($this->db->iudProc($packageSql, $params) === false)
            return false;
        $params['statustime'] = $statustime;
        $statusSql = "INSERT INTO PackagesStatus(StatusTime, Status, Activity, Location, PackagesID) "
                . "VALUES (:statustime, 'Ground US', '离开威彻斯特，发往纽约分拣中心。', 'Westchester', :id)";
        if ($this->db->iudProc($statusSql, $params) === false)
            return false;
        $deliverySql = "INSERT INTO Deliveries (PackagesID, TransportersServicesID, TrackingNumber, OutboundWarehousesID, OutboundTime, OutboundEmployeesID) "
                . "VALUES (:id, :transportersServicesID, :trackingNumber, :outboundWarehousesID, :statustime, :outboundEmployeeID)";
        $params['transportersServicesID'] = $package['TransporterServiceID'];
        $params['trackingNumber'] = $package['TransporterTrackNum'];
        $params['outboundWarehousesID'] = $warehouse;
        $params['outboundEmployeeID'] = $user;
        return $this->db->iudProc($deliverySql, $params);
    }

    public function findPackagePhone($tracknum, $pkid) {
        $sql = "SELECT Ph.Number AS PhoneNumber, TT.Name AS TransferTransporter, D.TransferTrackingNumber FROM Packages AS P INNER JOIN Recipients AS R ON P.RecipientsID = R.ID INNER JOIN Phones AS Ph ON R.PhonesID = Ph.ID LEFT JOIN Deliveries AS D ON P.ID = D.PackagesID LEFT JOIN Transporters AS TT ON D.TransferTransportersID = TT.ID WHERE P.ID = :id AND P.TrackingNumber = :trackingNumber";
        $recipPhone = $this->db->select($sql, ["id" => $pkid, "trackingNumber" => $tracknum]);
        return $recipPhone !== false && count($recipPhone) === 1 ? $recipPhone[0] : false;
    }

    public function findPackageDelivery($tracknum, $pkid) {
        $sql = "SELECT D.ID FROM Deliveries AS D INNER JOIN Packages AS P WHERE P.ID = :id AND P.TrackingNumber = :trackingNumber";
        $delivery = $this->db->select($sql, ["id" => $pkid, "trackingNumber" => $tracknum]);
        return $delivery !== false && count($delivery) > 0;
    }

    public function updateStatus($packageID, $params = [], $statusTime = "") {
        $sql = "INSERT INTO PackagesStatus (StatusTime, Status, Activity, Location, PackagesID) VALUES ("
                . (empty($statusTime) ? "NOW()" : ":statusTime")
                . ", :status, :activity, :location, :packagesID)";
        $params = array(
            "status" => $params['status'],
            "activity" => $params['activity'],
            "location" => $params['location'],
            "packagesID" => $packageID);
        if (!empty($statusTime))
            $params['statusTime'] = $statusTime;
        return $this->db->iudProc($sql, $params);
    }

    public function updateTransferStatus($package, $location, $statusTime) {
        $sql = "INSERT INTO PackagesStatus (StatusTime, Status, Activity, Location, PackagesID) VALUES (:statusTime, :status, :activity, :location, :packagesID)";
        if ($this->db->iudProc($sql, array("statusTime" => $statusTime,
                    "status" => 'Ground China',
                    "activity" => "国内配送。  转国内【" . $package['Transporter'] . "】，单号【" . $package['TransporterTrackNum'] . "】",
                    "location" => $location,
                    "packagesID" => $package[1])) === false)
            return false;
        $sql = "UPDATE Deliveries SET TransferTransportersID = :transportersID, TransferTrackingNumber = :trackingNumber WHERE PackagesID = :packagesID";
        if ($this->db->iudProc($sql, array("transportersID" => $package['TransporterID'],
                    "trackingNumber" => $package['TransporterTrackNum'],
                    "packagesID" => $package[1])) === false)
            return false;
        $sql = "UPDATE Packages SET Status = :status WHERE ID = :id";
        return $this->db->iudProc($sql, ["status" => 'Delivered', "id" => $package[1]]);
    }

    public function deletePackage($pkid) {
        $sqls = array("DELETE FROM PackagesStatus WHERE PackagesID = :pkid",
            "DELETE FROM PackagesDeclaration WHERE PackagesID = :pkid",
            "DELETE FROM Packages WHERE ID = :pkid LIMIT 1");
        foreach ($sqls as $sql) {
            if ($this->db->iudProc($sql, ['pkid' => $pkid]) === false)
                return false;
        }
    }
    
    public function findIDFromPackage($pkid, $tracknum) {
        $sql = "SELECT I.ID, IFNULL(I.IDStatus, 'Unsubmitted') AS IDStatus FROM Packages AS P INNER JOIN Recipients AS R ON R.ID = P.RecipientsID INNER JOIN AddressPeople AS AP ON AP.ID = R.AddressPeopleID LEFT JOIN Identification AS I ON AP.RecentIdentificationID = I.ID WHERE P.ID = :id AND P.TrackingNumber = :trackingNumber";
        $identification = $this->db->select($sql, ["id" => $pkid, "trackingNumber" => $tracknum]);
        return $identification !== false && count($identification) === 1 ? $identification[0] : false;
    }
    
    public function getIdentificationDetails($idid) {
        $sql = "SELECT CONCAT_WS('', LastName, FirstName) AS Name, Number, IDStatus FROM Identification WHERE ID = :id";
        $details = $this->db->select($sql, ["id" => $idid]);
        return $details === false || count($details) !== 1 ? false : $details[0];
    }
    
    public function markIdentification($idid, $verified) {
        $sql = "UPDATE Identification SET IDStatus = :status WHERE ID = :id";
        return $this->db->iudProc($sql, ["status" => $verified === '1' ? 'Verified' : 'Invalid', "id" => $idid]);
    }
}